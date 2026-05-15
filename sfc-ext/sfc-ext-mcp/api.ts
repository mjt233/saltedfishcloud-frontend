import { type CommonRequest } from 'sfc-common/model'

export const McpOauthApi = {
  prefix: 'mcp/oauth',

  /**
   * 获取当前用户已存在的 MCP ApiTicket。如果不存在则返回null，存在则返回经过遮掩的 ApiTIcket。
   */
  getExistingApiTicket(): CommonRequest<string | null> {
    return {
      url: `${this.prefix}/getExistingApiTicket`,
    }
  },

  /**
   * 根据OAuth回调授权码获取MCP ApiTicket 原文。
   * @param code MCP OAuth回调授权码
   */
  getApiTicket(code: string): CommonRequest<string> {
    return {
      url: `${this.prefix}/getApiTicket?code`,
      params: { code }
    }
  },

  /**
   * 获取系统的 MCP OAuth应用id，用于在转跳授权地址时拼接appId参数。
   * @returns MCP OAuth应用id
   */
  getAppId(): CommonRequest<string> {
    return {
      url: `${this.prefix}/getAppId`
    }
  }
}