import { StringUtils } from '@/utils/StringUtils'
import API from '@/api'
import { AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios'
import axios from 'axios'

import { Prog } from '@/utils/FileUtils/FileDataProcess'
import SfcUtils from '@/utils/SfcUtils'
import { reactive } from 'vue'
import FileUtils from '@/utils/FileUtils'
import { debug } from 'console'

export type FileUploadStatus = 'wait' | 'digest' | 'upload' | 'success' | 'failed' | 'pause'
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

  type: UploadType

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

export abstract class CommonFileUploadExecutor implements FileUploadExecutor {
  private config: AxiosRequestConfig
  protected file: File
  private digestCache = ''
  protected successHandler: ((e: AxiosResponse) => void)[] = []
  protected errorHandler: ((e: any) => void)[] = []
  protected finallyHandler: (() => void)[] = []
  protected uploadInfo: FileUploadInfo
  private cancelSource: CancelTokenSource
  private uploadPromise: Promise<any>|undefined
  private isInterrupt: boolean = false


  /**
   * 构造文件上传执行器
   * @param config 上传文件的axios配置
   * @param file 文件信息（仅用作信息获取，不参与上传）
   * @param alias 文件别名（file的文件名别名，仅用作信息获取，不参与上传）
   */
  constructor(config: AxiosRequestConfig, file: File, type: UploadType, alias?: string) {
    this.config = config
    this.file = file
    this.cancelSource = axios.CancelToken.source()
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
      type: type
    })
    this.initProgHandler()
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
  

  interrupt(): void {
    this.isInterrupt = true
    this.cancelSource.cancel()
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
    this.config.cancelToken = this.cancelSource.token

  }

  private async prepare():Promise<any> {
    const handler = this.handleDigest()
    if (handler instanceof Function) {
      const md5 = await this.getDigest()
      handler(md5, this.config)
    }
  }

  start(): Promise<any> {
    if (this.isInterrupt) {
      return Promise.reject('已中断')
    }
    if(!this.uploadPromise) {
      this.uploadPromise = this.upload()
    }
    return this.uploadPromise
  }

  private handleInterruptEvent() {
    SfcUtils.batchInvokeFunction(this.errorHandler, 'interrupt')
    SfcUtils.batchInvokeFunction(this.finallyHandler)
  }

  async upload() {

    if (this.uploadInfo.status == 'upload' || this.uploadInfo.status == 'digest') {
      throw new Error('已经正在上传中')
    }
    try {
      await this.prepare()
      if (this.isInterrupt) {
        this.handleInterruptEvent()
      }
      this.getUploadInfo().status = 'upload'
      this.uploadInfo.beginDate = new Date
      const ret = await SfcUtils.axios(this.config)
      this.uploadInfo.status = 'success'
      SfcUtils.batchInvokeFunction(this.successHandler, ret)
      return ret
    } catch(err) {
      SfcUtils.batchInvokeFunction(this.errorHandler)
      this.uploadInfo.status = 'failed'
    } finally {
      SfcUtils.batchInvokeFunction(this.finallyHandler)
    }
  }

  getUploadInfo(): FileUploadInfo {
    return this.uploadInfo
  }

  abstract resume(): void

  /**
   * 处理文件的md5，返回值决定在计算
   */
  abstract handleDigest(): ((md5: string, config: AxiosRequestConfig) => Promise<void>) | undefined | null | boolean
  abstract pause(): void
}

export class DirectFileUploadExecutor extends CommonFileUploadExecutor {
  constructor(config: AxiosRequestConfig, file:File, type: UploadType, alias?: string) {
    super(config, file, type, alias)
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

}

const DiskFileUploadService: FileUploadService = {
  uploadToDisk(uid: number, path: string, file: File): FileUploadExecutor {
    const config = API.file.upload(uid, path, file, '')
    return new DirectFileUploadExecutor(config, file, uid == 0 ? 'public' : 'private')
  }
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
  addExecutor(executor: FileUploadExecutor): void {
    const bindObj = {
      executor: executor,
      id: executor.getId(),
      index: this.bindList.length
    }
    this.executorList.push(executor)
    this.bindList.push(bindObj)
    this.bindMap.set(bindObj.id, bindObj)

    executor.onFinally(() => {
      this.removeExecutor(executor.getId())
      this.curUploadCount--
      this.startAll()
    })
    this.startAll()
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
      if (executor.getUploadInfo().status == 'wait') {
        executor.start()
        this.curUploadCount++
      }
    }
  }
}

const fileUploadTaskManager = new DefaultFileUploadTaskManager

export {
  DiskFileUploadService,
  fileUploadTaskManager
}