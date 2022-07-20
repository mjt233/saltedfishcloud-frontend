
export interface CollectionInfoField {
  /** 字段名 */
  name: string

  /** 字段类型 */
  type: 'TEXT' | 'OPTION'

  /** 默认值 */
  value: string

  /** 字段描述 */
  describe: string

  /** 要求字段值匹配的正则 */
  pattern: string

  /** 候选项字符串数组（仅当type为OPTION时有效） */
  options: string
}

export interface CollectionParam {
  /** 标题 */
  title : string

  /** 接收者署名 */
  nickname : string

  /** 收集过期日期 */
  expiredAt : number

  /** 收集到的文件保存目录节点ID */
  saveNode : string

  /** 收集任务描述 */
  describe?: string

  /** 文件名匹配表达式 */
  pattern?: string

  /** 最多接收的文件次数 */
  allowMax?: number

  /** 允许最大的文件大小，-1为无限制 */
  maxSize?: number

  /** 是否允许匿名用户上传 */
  allowAnonymous? : boolean

  /** 使用字段类型收集时允许的源文件后缀名表达式 */
  extPattern?: string

  /** 字段 */
  field? : CollectionInfoField[]

}

export type CollectionState = 'OPEN' | 'CLOSED'

export interface CollectionInfo extends CollectionParam {
  state: CollectionState

  id: number

  verification: string

  saveNode: string

  savePathSnapshot: string

  available: number

  createdAt: string
}

export interface FieldInfo {
  /** 字段名称 */
  name: string

  /** 字段值 */
  value: string
}

export interface CollectionSubmitInfo {
  /** 待提交的文件名 */
  filename: string

  /** 提交的字段数组信息 */
  field: FieldInfo[]
}
