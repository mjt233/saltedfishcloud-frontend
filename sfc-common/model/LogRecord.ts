import { PageableRequest, PageRequest, RangeRequest } from './ApiRequest'
import { AuditModel, NameValueType } from './Common'

/**
 * 日志记录统计数据
 */
export interface LogRecordStatisticVO {
  /**
   * 日志类型
   */
  type: string

  /**
   * 日志数量
   */
  count: number
}


export interface LogRecord extends AuditModel {

  /**
   * 日志类型
   */
  type: string

  /**
   * 日志级别
   */
  level: LogLevel

  /**
   * 产生日志的主机节点
   */
  producerHost: string

  /**
   * 产生日志的服务进程id
   */
  producerPid: number

  /**
   * 产生线程
   */
  producerThread: string

  /**
   * 日志摘要
   */
  msgAbstract: string

  /**
   * 消息详情
   */
  msgDetail: string
}

export type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

export type LogRecordStorage = NameValueType<string>

/**
 * 日志查询参数
 */
export interface LogRecordQueryParam {
  /**
   * 日志类型
   */
  type?: string[]

  /**
   * 指定主机
   */
  host?: string

  /**
   * 指定进程pid
   */
  pid?: number

  /**
   * 日志级别
   */
  level?: LogLevel[] | null

  /**
   * 数据日期范围
   */
  dateRange?: RangeRequest<Date>

  /**
   * 分页参数
   */
  pageableRequest?: PageableRequest
}