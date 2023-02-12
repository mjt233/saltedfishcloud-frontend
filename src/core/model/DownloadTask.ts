import { AsyncTaskRecord } from './AsyncTaskRecord'

export type DownloadTaskStatus = 'WAITING' | 'DOWNLOADING' | 'FAILED' | 'FINISH' | 'CANCEL'
export interface DownloadTaskInfo {
  /** 任务id */
  id: string

  /** 任务所属用户id */
  uid: number

  /** 下载url */
  url: string

  /** 使用的代理名称 */
  proxy: string

  /** 任务状态 */
  state: DownloadTaskStatus

  /** 任务消息 */
  message?: string

  /** 已完成的量 */
  loaded: number

  /** 任务总量 */
  size: number

  /** 速度：每秒钟处理的量 */
  speed: number

  /** 文件名 */
  name: string

  /** 保存位置 */
  savePath: string

  /** 创建日期 */
  createdAt: Date | string

  /** 完成日期 */
  finishAt?: Date | string

  /** 创建人 */
  createdBy: number

  /** 关联的异步任务信息 */
  asyncTaskRecord: AsyncTaskRecord
}