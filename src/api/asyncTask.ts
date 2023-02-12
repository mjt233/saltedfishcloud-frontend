import { CommonRequest, IdType } from '@/core/model'

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
  }
}

export default asyncTask