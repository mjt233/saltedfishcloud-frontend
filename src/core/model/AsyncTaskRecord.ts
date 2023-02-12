import { AuditModel } from './Common'

/**
 * 系统通用异步任务
 */
export interface AsyncTaskRecord extends AuditModel {
  /**
   * 任务类型
   */
  taskType: string

  /**
   * 任务名称
   */
  name: string

  /**
   * 任务参数
   */
  params: string

  /**
   * 任务执行日期
   */
  executeDate: string

  /**
   * 执行完成日期
   */
  finishDate: string

  /**
   * 失败日期
   */
  failedDate: string

  /**
   * 执行节点
   */
  executor: string

  /**
   * 任务状态，0 - 等待中，1 - 执行中，2 - 执行成功，3 - 执行失败，4 - 已取消
   */
  status: 0 | 1 | 2 | 3 | 4
}