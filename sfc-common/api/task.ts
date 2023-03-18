import { JpaPageInfo } from './../core/model/ApiRequest'
import { DownloadTaskInfo } from './../core/model/DownloadTask'
import { CommonRequest } from 'sfc-common/model'
import { StringUtils } from 'sfc-common/utils/StringUtils'
import { ProxyBaseInfo } from 'sfc-common/model/Proxy'
export type TaskType = 'DOWNLOAD' | 'FINISH' | 'ALL'
export type RequestMethod = 'GET' | 'POST'
export interface DownloadTaskCreateOpt {
  /** 文件URL */
  url: string

  /** 文件保存路径 */
  savePath: string

  /** 保存路径所属用户id */
  uid: number

  /** 请求方法 */
  method: RequestMethod

  /** 代理名称 */
  proxy?: string

  /** 额外请求头 */
  headers?: {[anyHeader: string]: string}
}

const task = {
  download: {
    prefix: '/task/download',
    /**
     * 中断（取消）一个下载中的任务
     * @param uid 用户ID
     * @param taskId 任务ID
     * @returns {import("axios").AxiosRequestConfig}
     */
    interruptTask(uid: number, taskId: string): CommonRequest {
      return {
        url: `${this.prefix}`,
        method: 'delete',
        params: {
          uid, taskId
        }
      }
    },
    /**
     * 获取任务列表（包括下载中与已完成的）
     * @param uid 用户ID
     * @param type 任务类型
     * @param page 页码，从1开始
     * @param size 每页大小
     * @returns
     */
    getTaskList(uid: number, type: TaskType, page = 1, size = 10): CommonRequest<JpaPageInfo<DownloadTaskInfo>> {
      return {
        url: `${this.prefix}`,
        params: {
          uid: uid,
          page: page,
          size: size,
          type: type
        }
      }
    },
    /**
     * 创建一个下载任务
     * @param opt 任务选项
     * @returns 任务id
     */
    create(opt: DownloadTaskCreateOpt): CommonRequest<string> {
      if (!opt.method) { opt.method = 'GET' }
      if (!opt.savePath) { opt.savePath = '/' }
      opt.savePath = opt.savePath.replace(/\/\/+/g, '/')
      opt.url = StringUtils.decodeURLPath(opt.url)
      return {
        method: 'POST',
        url: this.prefix,
        headers: {
          'Content-Type': 'application/json;charset=utf8'
        },
        data: opt
      }
    },
    /**
     * 获取可用的代理列表
     */
    getProxy(): CommonRequest<ProxyBaseInfo[]> {
      return {
        url: `${this.prefix}/proxy`
      }
    }
  }
}
export default task
