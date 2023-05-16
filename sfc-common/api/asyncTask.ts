import { CommonRequest, IdType } from 'sfc-common/model'

const asyncTask = {
  prefix: '/asyncTask',
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