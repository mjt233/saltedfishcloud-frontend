import { StringUtils } from '@/utils/StringUtils'
import API from '@/api'
import { AxiosPromise, AxiosRequestConfig, AxiosResponse, CancelToken, CancelTokenSource } from 'axios'
import axios from 'axios'

import { Prog } from '@/utils/FileUtils/FileDataProcess'
import SfcUtils from '@/utils/SfcUtils'
import { reactive } from 'vue'
import FileUtils from '@/utils/FileUtils'

export type FileUploadStatus = 'wait' | 'digest' | 'upload' | 'success' | 'failed' | 'pause'
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

}

export interface FileUploadExecutor {
  /**
   * 恢复下载
   */
  resume(): void

  /**
   * 暂停下载
   */
  pause(): void

  /**
   * 中断下载
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

  onFinish(handler: (e: AxiosResponse) => void): void

  onError(handler: (e: any) => void): void
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
  protected finishHandler: ((e: AxiosResponse) => void)[] = []
  protected errorHandler: ((e: any) => void)[] = []
  protected uploadInfo: FileUploadInfo
  private cancelSource: CancelTokenSource


  /**
   * 构造文件上传执行器
   * @param config 上传文件的axios配置
   * @param file 文件信息（仅用作信息获取，不参与上传）
   * @param alias 文件别名（file的文件名别名，仅用作信息获取，不参与上传）
   */
  constructor(config: AxiosRequestConfig, file: File, alias?: string) {
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
      beginDate: new Date
    })
    this.initProgHandler()
  }
  onFinish(handler: (e: AxiosResponse) => void): void {
    this.finishHandler.push(handler)
  }
  onError(handler: (e: any) => void): void {
    this.errorHandler.push(handler)
  }
  

  interrupt(): void {
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

  async start(): Promise<any> {

    if (this.uploadInfo.status == 'upload' || this.uploadInfo.status == 'digest') {
      throw new Error('已经正在上传中')
    }
    try {
      await this.prepare()
      this.getUploadInfo().status = 'upload'
      this.uploadInfo.beginDate = new Date
      const ret = await SfcUtils.axios(this.config)
      this.uploadInfo.status = 'success'
      this.finishHandler.forEach(handler => {
        handler(ret)
      })
      return ret
    } catch(err) {
      this.errorHandler.forEach(hanler => {
        hanler(err)
      })
      this.uploadInfo.status = 'failed'
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
  constructor(config: AxiosRequestConfig, file:File, alias?: string) {
    super(config,file, alias)
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
    return new DirectFileUploadExecutor(config, file)
  }
}

export {
  DiskFileUploadService
}