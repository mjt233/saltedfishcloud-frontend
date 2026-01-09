import { StringUtils, type FileInfo, type FileListContext } from 'sfc-common'
import { EncodeConvertFormData, EncodeConvertRule } from '../model'
import { VEUtils } from './VEUtils'
import * as actions from './actions'

export type TaskCreatorEvent = 
  | 'search-sub-path-start'      // 开始搜索子路径事件
  | 'search-sub-path-finish'     // 搜索子路径完成事件
  | 'video-file-found'           // 发现视频文件事件
  | 'search-finish'              // 搜索完成事件
  | 'convert-task-push-start'    // 开始创建转码任务事件
  | 'convert-task-push-finish'   // 转码任务创建完成事件
  | 'all-finish'                 // 所有任务创建完成事件
  | 'error'                      // 转码任务创建失败事件
  | 'ended'                      // 转码任务创建结束事件（无论成功还是失败）

/**
 * 批量转码任务事件回调参数类型映射
 */
export interface TaskCreatorEventMap {
  'search-sub-path-start': [path: string]
  'search-sub-path-finish': [path: string, files: FileInfo[]]
  'video-file-found': [file: FileInfo]
  'search-finish': [files: FileInfo[]]
  'convert-task-push-start': [file: FileInfo]
  'convert-task-push-finish': [file: FileInfo, taskId: string],
  'all-finish': [taskId: string[]]
  'error': [ error: any]
  'ended': [isSuccess: boolean]
}

export interface  TaskCreatorOptions { 
  /**
   * 是否可以搜索子路径
   * @param path 待搜索路径
   * @param dir 文件夹信息
   */
  isCanSearch?(dir: FileInfo): boolean
}
export class ConvertTaskCreator {
  private eventListeners: Map<TaskCreatorEvent, Array<Function>> = new Map()
  private isAbort = false
  constructor(
    private ctx: FileListContext,
    private rawFormData: EncodeConvertFormData,
    private options?: TaskCreatorOptions
  ) {
    
  }

  abort() {
    this.isAbort = true
  }

  private checkAbort() {
    if (this.isAbort) {
      throw new Error('cancel')
    }
  }

  isMultipartFile() {
    return this.ctx.selectFileList.length > 1 || this.ctx.selectFileList.some(f => f.dir)
  }

  async startCreate() {
    let isSuccess = true
    try {
      return await this.doStartCreate()
    } catch(err) {
      isSuccess = false
      this.dispatchEvent('error', err)
    } finally {
      this.dispatchEvent('ended', isSuccess)
    }
  }

  /**
   * 开始创建任务
   */
  private async doStartCreate() {
    const newTaskIds: string[] = []
    if (!this.isMultipartFile()) {
      const aFile = this.ctx.selectFileList[0]
      this.dispatchEvent('convert-task-push-start', aFile)
      newTaskIds.push((await window.SfcUtils.request(await actions.generateConvertTaskParams(this.ctx, this.rawFormData, aFile, this.rawFormData.savePath))).data.data)
      this.dispatchEvent('convert-task-push-finish', aFile, newTaskIds[0])
      this.dispatchEvent('all-finish', newTaskIds)
      return newTaskIds
    }
  
    // 获取文件列表操作器，用于获取文件列表
    const fileListHandler = this.ctx.modelHandler
    this.ctx.selectFileList.forEach(f => f.path = this.ctx.path)

    // 待搜索的目录
    let dirs = this.ctx.selectFileList.filter(f => f.dir)

    // 已发现的视频文件
    const videoFiles = this.ctx.selectFileList.filter(f => !f.dir && actions.isVideo(f.name))

    // 选中的文件中存在文件夹时，需要遍历文件夹下的所有视频类型文件，得到所有需要转码的视频文件
    while (dirs.length > 0) {
      this.checkAbort()
      const curDirs = dirs
      dirs = []
      await Promise.all(curDirs.map(async dir => {
        const dirFullPath = StringUtils.appendPath(dir.path as string, dir.name)

        // 触发文件夹遍历开始回调
        this.dispatchEvent('search-sub-path-start', dirFullPath)
        this.checkAbort()
        const subFiles = (await fileListHandler.list(dirFullPath)).filter(f => {
          if (!f.dir) {
            return true
          }
          if (this.options ?.isCanSearch) {
            return this.options.isCanSearch(f)
          } else {
            return true
          }
        })
        // 触发文件夹遍历完成回调
        this.dispatchEvent('search-sub-path-finish', dirFullPath, subFiles)
        subFiles.forEach(async f => {
          this.checkAbort()
          f.path = dirFullPath
          if (!f.dir) {
          // 触发文件发现回调
            debugger
            if (actions.isVideo(f.name)) {
              this.dispatchEvent('video-file-found', f)
              videoFiles.push(f)
            }
          } else {
            dirs.push(f)
          }
        })
      }))
    }

    // 触发文件列表搜索完成回调
    this.dispatchEvent('search-finish', videoFiles)

    // 开始逐个文件发布转码任务
    const videoStreamRule = this.rawFormData.enabledConvertRules.find(r => r.type == 'video')
    const audioStreamRule = this.rawFormData.enabledConvertRules.find(r => r.type == 'audio')
    await Promise.all(videoFiles.map(async videoFile => {
      this.dispatchEvent('convert-task-push-start', videoFile)
      this.checkAbort()
      const videoInfo = await actions.getVideoInfo(this.ctx, videoFile, videoFile.path as string)
      const thisFormData: EncodeConvertFormData = {...this.rawFormData}
      // 参考表单中对视频或音频流的规则，应用于这个视频文件对应实际的所有流
      thisFormData.enabledConvertRules = videoInfo.streams.filter(s => {
        if (s.codecType == 'video' && !videoStreamRule) {
          return false
        }
        if (s.codecType == 'audio' && !audioStreamRule) {
          return false
        }
        return true
      }).map(s => {
        if (s.codecType == 'video') {
          return {...videoStreamRule as EncodeConvertRule, index: s.index}
        } else if (s.codecType == 'audio') {
          return {...audioStreamRule as EncodeConvertRule, index: s.index}
        } else {
          return {index: s.index, method: 'copy', encoder: 'copy', type: s.codecType}
        }
      })
      
      // 组装新文件名
      if (thisFormData.format != 'keep') {
      // 指定muxer时，将文件名修改为指定格式
        thisFormData.fileName = videoFile.name.replace(/\.\w+$/, `.${VEUtils.getFormatExtName(this.rawFormData.format)}`)
      } else {
      // 未指定muxer时，文件名不变，并使用文件原始格式对应的muxer
        thisFormData.fileName = videoFile.name
        thisFormData.format = VEUtils.getExtNameMuxer(videoFile.name.split('.').pop() as string)
      }
      
      // 根据批量转码的路径规则，组装新文件保存路径
      if (thisFormData.pathStrategy == 'same') {
        thisFormData.savePath = videoFile.path as string
      } else if (thisFormData.pathStrategy == 'fixed') {
        thisFormData.savePath = this.rawFormData.savePath
      } else if (thisFormData.pathStrategy == 'relative') {
        thisFormData.savePath = VEUtils.resolveRelativePath(videoFile.path as string, this.rawFormData.savePath)
      }
      
      this.checkAbort()
      const taskCreateApiParams = await actions.generateConvertTaskParams(this.ctx, thisFormData, videoFile, thisFormData.savePath)
      const taskId = (await window.SfcUtils.request(taskCreateApiParams)).data.data
      this.dispatchEvent('convert-task-push-finish', videoFile, taskId)
      newTaskIds.push(taskId)
    }))
    this.dispatchEvent('all-finish', newTaskIds)
    return newTaskIds
  }
  
  /**
   * 添加事件监听器
   * @param type 事件类型
   * @param listener 事件回调函数
   */
  addEventListener<K extends TaskCreatorEvent>(type: K, listener: (...args: TaskCreatorEventMap[K]) => void): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, [])
    }
    this.eventListeners.get(type)!.push(listener)
  }

  
  /**
   * 移除事件监听器
   * @param type 事件类型
   * @param listener 要移除的事件回调函数
   */
  removeEventListener<K extends TaskCreatorEvent>(type: K, listener: (...args: TaskCreatorEventMap[K]) => void): void {
    const listeners = this.eventListeners.get(type)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }
  
  /**
   * 派发事件
   * @param type 事件类型
   * @param args 事件参数
   */
  dispatchEvent<K extends TaskCreatorEvent>(type: K, ...args: TaskCreatorEventMap[K]): void {
    const listeners = this.eventListeners.get(type)
    if (listeners) {
      listeners.forEach(listener => {
        listener(...args)
      })
    }
  }
}