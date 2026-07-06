import type { DownloadTaskInfo, ProxyInfo } from '../model'

/**
 * 任务类型。
 */
export type TaskType = 'DOWNLOADING' | 'FINISH' | 'FAILED' | 'ALL'

/**
 * 请求方法。
 */
export type RequestMethod = 'GET' | 'POST'

/**
 * 下载任务创建选项
 */
export interface DownloadTaskCreateOpt {
  /** 文件URL */
  url: string

  /** 文件保存路径 */
  savePath: string

  /** 保存路径所属用户id */
  uid: number | string

  /** 请求方法 */
  method: RequestMethod

  /** 代理名称 */
  proxy?: string

  /** 额外请求头 */
  headers?: { [anyHeader: string]: string }
}

/**
 * 分页信息
 */
export interface JpaPageInfo<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

/**
 * 通用请求配置
 */
export interface CommonRequest<T = unknown> {
  url: string
  method?: string
  params?: Record<string, unknown>
  data?: unknown
  headers?: Record<string, string>
}

/**
 * 下载任务相关 API
 */
const downloadApi = {
  prefix: '/task/download',

  /**
   * 中断（取消）一个下载中的任务
   * @param uid 用户ID
   * @param taskId 任务ID
   */
  interruptTask(uid: number | string, taskId: string): CommonRequest {
    return {
      url: `${this.prefix}`,
      method: 'delete',
      params: { uid, taskId }
    }
  },

  /**
   * 获取任务列表（包括下载中与已完成的）
   * @param uid 用户ID
   * @param type 任务类型
   * @param page 页码，从1开始
   * @param size 每页大小
   */
  getTaskList(uid: number | string, type: TaskType, page = 1, size = 10): CommonRequest<JpaPageInfo<DownloadTaskInfo>> {
    return {
      url: `${this.prefix}`,
      params: { uid, page, size, type }
    }
  },

  /**
   * 创建一个下载任务
   * @param opt 任务选项
   */
  create(opt: DownloadTaskCreateOpt): CommonRequest<string> {
    if (!opt.method) { opt.method = 'GET' }
    if (!opt.savePath) { opt.savePath = '/' }
    opt.savePath = opt.savePath.replace(/\/\/+/g, '/')
    // 解码 URL 路径
    try {
      opt.url = decodeURIComponent(opt.url)
    } catch {
      // 忽略解码错误
    }
    return {
      method: 'POST',
      url: this.prefix,
      headers: { 'Content-Type': 'application/json;charset=utf8' },
      data: opt
    }
  },

  /**
   * 获取可用的代理列表
   */
  getProxy(): CommonRequest<ProxyInfo[]> {
    return {
      url: `${this.prefix}/proxy`
    }
  }
}

export default downloadApi
