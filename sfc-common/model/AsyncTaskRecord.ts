import { AuditModel, IdType } from './Common'
const AsyncTaskRecordStatusDict = {
  0: '等待中',
  1: '执行中',
  2: '执行成功',
  3: '执行失败',
  4: '已取消',
  5: '任务离线'
}
export {
  AsyncTaskRecordStatusDict
}

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
   * 任务状态，0 - 等待中，1 - 执行中，2 - 执行成功，3 - 执行失败，4 - 已取消，5 - 任务离线
   */
  status: 0 | 1 | 2 | 3 | 4 | 5
}

/**
 * 任务进度明细
 */
export interface ProgressRecord {
  /**
   * 已完成的量
   */
  loaded: number

  /**
   * 目标完成量，-1为未知
   */
  total: number

  /**
   * 速度的上一次记录时间（Unix时间戳 毫秒）
   */
  lastUpdateTime: number

  /**
   * 每秒完成的量
   */
  speed: number
}

/**
 * 任务进度明细VO
 */
export interface ProgressRecordVO {
  taskId: IdType

  record: ProgressRecord
}