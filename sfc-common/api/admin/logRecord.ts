import { CommonPageInfo, CommonRequest, RangeRequest } from 'sfc-common/model'
import { LogRecord, LogRecordQueryParam, LogRecordStatisticVO, LogRecordStorage } from 'sfc-common/model/LogRecord'
import { useJsonBody } from 'sfc-common/utils'

const logRecord = {
  prefix: '/logRecord',
  /**
   * 查询日志明细
   * @param param 查询参数
   * @returns 查询结果
   */
  queryLog(param: LogRecordQueryParam): CommonRequest<CommonPageInfo<LogRecord>> {
    return useJsonBody({
      url: `${this.prefix}/queryLog`,
      data: param,
      method: 'post'
    })
  },
  /**
   * 查询各日志类型统计数据
   * @param param 查询参数
   * @returns 查询结果
   */
  queryLogStatistic(param?: RangeRequest<Date | string | number>): CommonRequest<LogRecordStatisticVO[]> {
    return useJsonBody({
      url: `${this.prefix}/queryLogStatistic`,
      data: param,
      method: 'post'
    })
  },
  /**
   * 列出系统支持的日志存储器
   * @returns 存储名称
   */
  listStorage(): CommonRequest<LogRecordStorage[]> {
    return {
      url: `${this.prefix}/listStorage`
    }
  }
}

export default logRecord