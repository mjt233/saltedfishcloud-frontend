import { CommonPageRequestParam, CommonRequest, IdType, PageRequest } from 'sfc-common/model'
import { AsyncTaskRecord } from 'sfc-common/model/AsyncTaskRecord'

const asyncTask = {
  prefix: '/asyncTask',
  /**
   * 根据id获取任务信息
   * @param taskId 任务id
   */
  getById(taskId: IdType): CommonRequest<AsyncTaskRecord> {
    return {
      url: `${this.prefix}/getById`,
      params: {
        taskId
      }
    }
  },
  /**
   * 按条件查询任务记录
   * @param params 查询参数
   */
  listRecord(params: { uid?: IdType, status?: number[] } & CommonPageRequestParam): PageRequest<AsyncTaskRecord> {
    return {
      url: `${this.prefix}/listRecord`,
      params: params
    }
  },
  /**
   * 获取任务执行日志
   * @param taskId 任务id
   */
  getLog(taskId: IdType): CommonRequest<string> {
    return {
      url: `${this.prefix}/getLog`,
      params: {
        taskId
      }
    }
  },
  /**
   * 中断一个异步任务的执行
   * @param taskId 任务id
   */
  interrupt(taskId: IdType): CommonRequest {
    return {
      url: `${this.prefix}/interrupt`,
      params: {
        taskId
      }
    }
  },
  /**
   * 等待任务是否执行完成退出
   * @param taskId 任务id
   * @param timeout 最长等待时长，单位是秒
   * @returns     是否已执行完成
   */
  waitTaskExit(taskId: IdType, timeout?: number): CommonRequest<boolean> {
    return {
      url: `${this.prefix}/waitTaskExit`,
      params: {
        taskId,
        timeout: timeout || 10000
      }
    }
  }
}

export default asyncTask