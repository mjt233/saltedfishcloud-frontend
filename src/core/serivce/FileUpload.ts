import { StringUtils } from '@/utils/StringUtils'
import API from '@/api'
import { AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'

import { Prog } from '@/utils/FileUtils/FileDataProcess'
import SfcUtils from '@/utils/SfcUtils'
import { reactive } from 'vue'
import FileUtils from '@/utils/FileUtils'
import { BreakPointTaskMetaData } from '../model/BreakPointTask'

export type FileUploadStatus = 'wait' | 'digest' | 'upload' | 'success' | 'failed' | 'pause' | 'interrupt'
export type UploadType = 'public' | 'private'
export interface FileUploadInfo {
  /**
   * 上传的文件
   */
  file: File

  /**
   * 文件名别名
   */
  alias: string

  /**
   * 处理进度
   */
  prog: Prog

  /**
   * 上传处理进度
   */
  status: FileUploadStatus

  /**
   * 上传任务的唯一id（仅用于前端）
   */
  uploadId: string

  /**
   * 任务开始日期
   */
  beginDate: Date

  /**
   * 任务结束日期
   */
  endDate: Date

  /**
   * 上传任务类型
   */
  type: UploadType

  /**
   * 文件md5
   */
  md5: string

  /**
   * 其他自定义属性
   */
  otherAttr?: any

}

export interface FileUploadExecutor {

  /**
   * 上传任务ID
   */
  getId(): string

  /**
   * 恢复上传
   */
  resume(): void

  /**
   * 暂停上传
   */
  pause(): void

  /**
   * 中断上传
   */
  interrupt(): void

  /**
   * 获取文件MD5摘要
   */
  getDigest(): Promise<string>

  /**
   * 开始上传
   */
  start(): Promise<any>

  /**
   * 获取上传的文件信息和进度
   */
  getUploadInfo(): FileUploadInfo

  onSuccess(handler: (e: AxiosResponse) => void): void

  onError(handler: (e: any) => void): void

  onFinally(handler: () => void): void
}

export type TaskManagerEvent = 'add' | 'remove' | 'success' | 'error' | 'finally'

export type TaskManagerEventListener = (executor: FileUploadExecutor) => void

/**
 * 结果执行策略，决定后续步骤的执行策略
 * continue - 继续执行
 * finish - 流程完成（提前结束）
 * interrupt - 流程终止（提前结束）
 */
export type ResultExecuteStrategy = 'continue' | 'finish' | 'interrupt'

/**
 * 文件摘要信息处理器。
 * 在执行器计算出文件摘要信息（一般是md5）后会调用该方法，由该方法的返回值决定后续执行步骤
 */
export type DigestHandler = (md5: string, config: AxiosRequestConfig) => Promise<ResultExecuteStrategy>
/**
 * 文件上传任务管理器
 */
export interface FileUploadTaskManager {
  /**
   * 添加一个上传执行器纳入到管理中
   * @param executor 上传执行器
   */
  addExecutor(executor: FileUploadExecutor): void

  /**
   * 获取所有的执行器
   */
  getAllExecutor(): FileUploadExecutor[]
  
  /**
   * 根据id获取执行器
   * @param id 执行器id
   */
  getById(id: string): FileUploadExecutor | undefined

  /**
   * 移除执行器
   * @param id 被移除的执行任务id
   */
  removeExecutor(id: string): boolean

  /**
   * 获取最大同时上传数量
   */
  getMaxTaskCount(): number

  /**
   * 设置最大同时上传数量
   */
  setMaxTaskCount(count: number): void

  addEventListener(event: TaskManagerEvent, listener: TaskManagerEventListener): void

  removeEventListener(event: TaskManagerEvent, listener: TaskManagerEventListener): void

}

export interface FileUploadService {
  /**
   * 上传文件到用户网盘
   * @param uid 用户id
   * @param path 文件所在路径
   * @param file 文件
   */
  uploadToDisk(uid: number, path: string, file: File): FileUploadExecutor
}

export interface ExecutorOption {
  type: UploadType

  /**
   * 文件信息（仅用作信息获取，不参与上传）
   */
  file: File

  /**
   * 文件别名（file的文件名别名，仅用作信息获取，不参与上传）
   */
  alias?: string

  /**
   * 上传文件的axios配置
   */
  config: AxiosRequestConfig

  /**
   * 摘要信息处理器。
   * 可通过该方法进行秒传，秒传成功后返回finish提前结束流程。
   */
  digestHandler?: DigestHandler

  /**
   * 其他属性
   */
  otherAttr?: any
}

export abstract class CommonFileUploadExecutor implements FileUploadExecutor {
  private config: AxiosRequestConfig
  protected file: File
  private digestCache = ''
  protected successHandler: ((e: AxiosResponse) => void)[] = []
  protected errorHandler: ((e: any) => void)[] = []
  protected finallyHandler: (() => void)[] = []
  protected uploadInfo: FileUploadInfo
  private uploadPromise: Promise<any>|undefined
  protected opt: ExecutorOption

  /**
   * 构造文件上传执行器
   */
  constructor(opt: ExecutorOption) {
    const {config, file, alias, type, otherAttr} = opt
    this.opt = opt
    this.config = config
    this.file = file
    this.uploadInfo = reactive({
      alias: alias || file.name,
      file: file,
      prog: reactive({
        loaded: 0,
        total: 0
      }),
      status: 'wait',
      uploadId: StringUtils.getRandomStr(32),
      beginDate: new Date,
      endDate: new Date,
      type: type,
      md5: '',
      otherAttr: otherAttr
    })
  }
  onFinally(handler: () => void): void {
    this.finallyHandler.push(handler)
  }
  getId(): string {
    return this.uploadInfo.uploadId
  }
  onSuccess(handler: (e: AxiosResponse) => void): void {
    this.successHandler.push(handler)
  }
  onError(handler: (e: any) => void): void {
    this.errorHandler.push(handler)
  }
  

  async getDigest(): Promise<string> {
    if (!this.digestCache) {
      const originStatus = this.uploadInfo.status
      this.uploadInfo.status = 'digest'
      this.digestCache = await FileUtils.computeMd5(this.file, {
        prog: e => {
          this.uploadInfo.prog.loaded = e.loaded
          this.uploadInfo.prog.total = e.total
        }
      })
      this.uploadInfo.status = originStatus
    }
    return this.digestCache
  }
  

  /**
   * 初始化进度监听和cancelToken
   */
  private initProgHandler() {
    const originProgressHandler = this.config.onDownloadProgress
    const progUpdateHandler = (e: any) => {
      this.uploadInfo.prog.loaded = e.loaded
      this.uploadInfo.prog.total = e.total
    }
    let wrapHandler: any
    // 已配置进度处理器 且 处理器未经过包装
    if(originProgressHandler && !(originProgressHandler as any).isWrap ) {
      wrapHandler = (e: any) => {
        originProgressHandler(e)
        progUpdateHandler(e)
      }
    } else {
      wrapHandler = progUpdateHandler
    }
    
    wrapHandler.isWrap = true
    
    this.config.onUploadProgress = progUpdateHandler

  }

  protected async prepare():Promise<ResultExecuteStrategy> {
    const handler = this.opt.digestHandler
    if (handler instanceof Function) {

      // 虽然getDigest里会设置digest状态，但由于是异步执行，start后无法立即修改状态导致UploadManager误判状态重复执行start从而导致无效启动且执行计数增加无效值
      // 最坏的情况下会导致执行计数永久保持最大值
      this.uploadInfo.status = 'digest'
      const md5 = await this.getDigest()
      this.uploadInfo.md5 = md5
      return await handler(md5, this.config)
    } else {
      this.uploadInfo.status = 'upload'
      return 'continue'
    }
  }

  start(): Promise<any> {
    if(!this.uploadPromise) {
      this.initProgHandler()
      this.uploadPromise = this.upload()
    }
    return this.uploadPromise
  }


  async upload() {
    try {
      const strategy = await this.prepare()
      this.getUploadInfo().status = 'upload'
      this.uploadInfo.beginDate = new Date

      if (strategy == 'continue') {
        const ret = await SfcUtils.axios(this.config)
        this.handleSuccessEvent(ret)
        return ret
      } else if (strategy == 'finish') {
        this.uploadInfo.prog.loaded = this.uploadInfo.prog.total
        this.uploadInfo.endDate = new Date
        this.handleSuccessEvent('finish-strategy')
      }
    } catch(err) {
      this.handleErrorEvent(err)
      this.uploadInfo.status = 'failed'
    } finally {
      this.uploadInfo.endDate = new Date()
      this.handleFinallyEvent()
    }
  }

  /**
   * 调用所有的成功事件回调执行器
   * @param param 传递的事件参数
   */
  protected handleSuccessEvent(param?: any) {
    this.uploadInfo.status = 'success'
    SfcUtils.batchInvokeFunction(this.successHandler, param)
  }

  /**
   * 调用所有的失败事件回调执行器
   * @param err 错误信息
   */
  protected handleErrorEvent(err: any) {
    this.uploadInfo.status = 'failed'
    SfcUtils.batchInvokeFunction(this.errorHandler, err)
  }

  /**
   * 调用所有的finally事件执行器
   */
  protected handleFinallyEvent() {
    this.uploadInfo.endDate = new Date
    SfcUtils.batchInvokeFunction(this.finallyHandler)
  }

  private handleInterruptEvent() {
    this.handleErrorEvent('interrupt')
    this.handleFinallyEvent()
  }

  getUploadInfo(): FileUploadInfo {
    return this.uploadInfo
  }

  abstract resume(): void

  abstract pause(): void
  abstract interrupt(): void
}

export class DirectFileUploadExecutor extends CommonFileUploadExecutor {
  private cancelTokenSource = axios.CancelToken.source()
  constructor(opt: ExecutorOption) {
    super(opt)
    opt.config.cancelToken = this.cancelTokenSource.token
  }
  
  handleDigest() {
    return async(md5: string, config: AxiosRequestConfig) => {
      config.data.set('md5', md5)
    }
  }
  resume(): void {
    this.start()
  }
  pause(): void {
    throw new Error('不支持暂停')
  }
  interrupt(): void {
    this.cancelTokenSource.cancel('interrupt')
    this.handleErrorEvent('interrupt')
  }

}


const DiskFileUploadService: FileUploadService & any = {
  uploadToDisk(uid: number, path: string, file: File): FileUploadExecutor {
    
    
    const queickUploadHandler: DigestHandler = async(md5, config) => {
      const result = await SfcUtils.request(API.file.quickSave(uid, path, file.name, md5))
      if (result.data.data) {
        return 'finish'
      } else {
        (config.data as FormData).set('md5', md5)
        return 'continue'
      }
    }
    function directUploadToDisk(): FileUploadExecutor {
      const config = API.file.upload(uid, path, file, '')
      return new DirectFileUploadExecutor({
        file,
        config,
        type: uid == 0 ? 'public' : 'private',
        otherAttr: {
          uid,
          path
        },
        digestHandler: queickUploadHandler
      })
    }

    function breakpointUpload(): FileUploadExecutor {
      const config = API.file.upload(uid, path, null, '')
      return new BreakPointUploadExecutor({
        file,
        config,
        type: uid == 0 ? 'public' : 'private',
        otherAttr: {
          uid,
          path
        },
        digestHandler: queickUploadHandler
      })
    }

    if (file.size < _8MiB) {
      return directUploadToDisk()
    } else {
      return breakpointUpload()
    }
  },

}

interface BindIdExecutor {
  id: string,

  executor: FileUploadExecutor

  index: number
}

export class DefaultFileUploadTaskManager implements FileUploadTaskManager {
  private executorList: FileUploadExecutor[] = reactive([])
  private bindList: BindIdExecutor[] = []
  private bindMap = new Map<string, BindIdExecutor>()
  private curUploadCount = 0
  private maxUploadCount = 3
  private listenerMap = new Map<TaskManagerEvent, TaskManagerEventListener[]>()
  addExecutor(executor: FileUploadExecutor): void {
    const bindObj = {
      executor: executor,
      id: executor.getId(),
      index: this.bindList.length
    }
    this.executorList.push(executor)
    this.bindList.push(bindObj)
    this.bindMap.set(bindObj.id, bindObj)
    this.dispatchEvent('add', executor)
    executor.onFinally(() => {
      this.removeExecutor(executor.getId())
      this.curUploadCount--
      this.startAll()
    })
    executor.onSuccess(() => this.dispatchEvent('success', executor))
    executor.onError(() => this.dispatchEvent('error', executor))
    executor.onFinally(() => this.dispatchEvent('finally', executor))

    this.startAll()
  }
  removeEventListener(event: TaskManagerEvent, listener: TaskManagerEventListener): void {
    const list = this.listenerMap.get(event)
    if (list == undefined) {
      return
    }
    const idx = list.findIndex(e => e == listener)
    if (idx == -1) {
      return
    }
    list.splice(idx, 1)
  }
  addEventListener(event: TaskManagerEvent, listener: TaskManagerEventListener): void {
    let list = this.listenerMap.get(event)
    if (list == undefined) {
      list = []
      this.listenerMap.set(event, list)
    }

    list.push(listener)
  }
  setMaxTaskCount(count: number): void {
    this.maxUploadCount = count
  }
  getMaxTaskCount(): number {
    return this.maxUploadCount
  }
  getAllExecutor(): FileUploadExecutor[] {
    return this.executorList
  }
  getById(id: string): FileUploadExecutor | undefined {
    return this.bindMap.get(id)?.executor
  }
  removeExecutor(id: string): boolean {
    const item = this.bindMap.get(id)
    if (item == undefined) {
      return false
    }
    this.dispatchEvent('remove', item.executor)
    this.executorList.splice(item.index, 1)
    this.bindList.splice(item.index, 1)
    this.bindMap.delete(id)
    for (let i = item.index; i < this.bindList.length; i++) {
      const element = this.bindList[i]
      element.index--
    }
    return true
  }

  /**
   * 在最大同时上传数量范围内尽可能启动上传
   */
  private startAll() {
    if (this.curUploadCount >= this.maxUploadCount) {
      return
    }
    for(let executor of this.executorList) {
      if (this.curUploadCount >= this.maxUploadCount) {
        break
      }
      const info = executor.getUploadInfo()
      if (info.status == 'wait') {
        executor.start()
        this.curUploadCount++
      }
    }
  }

  private dispatchEvent(event: TaskManagerEvent, executor: FileUploadExecutor) {
    const listeners = this.listenerMap.get(event)
    if (listeners) {
      SfcUtils.batchInvokeFunction(listeners, executor)
    }
  }
}
/**
 * 生成符合断点续传接口解析规则的文件切片长度范围字符串
 * @param startPos 起始位置
 * @param count 分片数量
 * @param chunkCount 允许的总切片分块数量
 * @returns 切片范围字符串
 */
function getPartRange(startPos: number, count: number, chunkCount: number) {
  let endPos = startPos + count
  if (endPos > chunkCount) {
    endPos = chunkCount
  }
  return `${startPos == endPos ? startPos : `${startPos}-${endPos}`}`
}



const _8MiB = 1024 * 1024 * 8
export class BreakPointUploadExecutor extends CommonFileUploadExecutor {
  private breakPointOpt: ExecutorOption
  private metaData: BreakPointTaskMetaData | undefined
  private sliceGenerator: Generator<Blob, void> | undefined
  private uploadPromiseObj: Promise<any> | undefined
  private cancelToken = axios.CancelToken.source()
  constructor(opt: ExecutorOption) {
    super(opt)
    this.breakPointOpt = opt
  }
  start(): Promise<any> {
    if (this.uploadPromiseObj) {
      return this.uploadPromiseObj
    }
    this.uploadPromiseObj = (async() => {
      try {
        this.uploadInfo.beginDate = new Date
        const strategy = await this.prepare()
        this.uploadInfo.status = 'upload'
        if (strategy == 'finish') {
          this.uploadInfo.prog.loaded = this.uploadInfo.prog.total
          this.uploadInfo.endDate = new Date
          this.handleSuccessEvent('finish-strategy')
        } else if (strategy == 'continue') {
          this.metaData = await this.createBreakPointTask()
          await this.uploadSlice()
          const ret = await this.mergeRequest()
          this.handleSuccessEvent(ret)
        }

      } catch (err) {
        this.handleErrorEvent(err)
      } finally {
        this.handleFinallyEvent()
      }
    })()

    return this.uploadPromiseObj
  }
  resume(): void {
    throw new Error('Method not implemented.')
  }
  pause(): void {
    throw new Error('Method not implemented.')
  }
  /**
   * 创建断点续传任务
   */
  private async createBreakPointTask(): Promise<BreakPointTaskMetaData> {
    const name = this.breakPointOpt.file.name
    const size = this.breakPointOpt.file.size
    let chunkSize = _8MiB
    if(size < chunkSize) {
      chunkSize = size
    }
    const conf = API.breakpoint.createTask(name, size, chunkSize)
    conf.cancelToken = this.cancelToken.token
    return (await SfcUtils.request(conf)).data
  }
  private async uploadSlice() {
    let finishSize = 0
    this.sliceGenerator = FileUtils.sliceFile(this.breakPointOpt.file, this.metaData?.chunkSize)
    let sliceData
    let startPos = 1

    // 分块倍数
    let multiple = 1
    while ((sliceData = this.getSlice(multiple))) {
      let curPartFinishSize = 0
      const range = getPartRange(startPos, multiple, this.metaData?.chunkCount as number)
      const conf = API.breakpoint.uploadPart(this.metaData?.taskId as string, sliceData, range)
      conf.onUploadProgress = (e: Prog) => {
        curPartFinishSize = e.loaded
        this.uploadInfo.prog.loaded = finishSize + curPartFinishSize
      }
      conf.cancelToken = this.cancelToken.token

      const begin = new Date().getTime()
      await SfcUtils.request(conf)

      // 上传花费的时（秒）
      const sec = (new Date().getTime() - begin) / 1000
      finishSize += sliceData.size
      startPos += multiple

      // 若花费时间大于8秒，则重新调整块大小至期望值5秒
      if (sec > 8 || sec < 3) {
        multiple = Math.ceil(5 / (sec / multiple))
        if (multiple < 1) {
          multiple = 1
        }
          
      }
    }
  }

  /**
   * 获取指定数量的文件切片数据（多个切片合并为1个Blob）
   * @param mergeCount 合并切片的数量
   */
  private getSlice(mergeCount: number): Blob | null {
    
    let cnt = 0
    let tmp: IteratorResult<Blob, any>
    let res = new Blob()
    while (cnt < mergeCount && !(tmp = (this.sliceGenerator as Generator<Blob>).next()).done) {
      res = new Blob([res, tmp.value])
      cnt++
    }
    return res.size == 0 ? null : res
  }

  private async mergeRequest(): Promise<any> {
    const conf = this.breakPointOpt.config
    if (!conf.params) {
      conf.params = {}
    }
    conf.params.breakpoint_id = this.metaData?.taskId
    const ret = await SfcUtils.axios(conf)
    return ret
  }
  
  interrupt(): void {
    this.cancelToken.cancel()
    this.handleErrorEvent('interrupt')
  }
}

const fileUploadTaskManager = new DefaultFileUploadTaskManager

export {
  DiskFileUploadService,
  fileUploadTaskManager
}