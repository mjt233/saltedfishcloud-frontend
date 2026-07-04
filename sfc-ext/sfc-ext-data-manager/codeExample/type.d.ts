import type { IdType } from 'sfc-common/model'

export interface CodeExample {
  /**
   * 代码样例唯一标识
   */
  id: IdType

  /**
   * 代码样例标签名称
   */
  label: string

  /**
   * 代码样例内容
   */
  content: string
}