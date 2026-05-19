export interface McpOAuthCallbackData {
  msg?: string

  isSuccess: boolean

  apiTicket?: string

  type: 'McpOAuthCallbackData'
}