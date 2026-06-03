import { type IdType } from 'sfc-common/model'

export interface McpOAuthCallbackData {
  msg?: string

  isSuccess: boolean

  apiTicket?: string

  type: 'McpOAuthCallbackData'
}

/**
 * MCP API Key 列表展示对象。
 */
export interface McpApiKeyVo {
  /** API Key 主键ID */
  id: IdType

  /** API Key 名称 */
  name: string

  /** API Key 脱敏值 */
  maskedToken: string

  /** 创建时间 */
  createAt: string

  /** 更新时间 */
  updateAt: string
}

/**
 * MCP API Key 新生成后的原文信息。
 */
export interface McpApiKeyRawInfo {
  /** 新生成的 API Key 原文 */
  apiKey: string
}