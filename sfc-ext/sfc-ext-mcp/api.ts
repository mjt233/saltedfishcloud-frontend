import { type CommonRequest, type IdType } from 'sfc-common/model'

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
      url: `${this.prefix}/getApiTicket`,
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

export const McpApiKeyApi = {
  prefix: 'mcp/apiKey',

  /**
   * 查询当前登录用户的 MCP API Key 列表。
   */
  list(): CommonRequest {
    return {
      url: `${this.prefix}/list`
    }
  },

  /**
   * 生成新的 MCP API Key 原文。
   * @param name API Key 名称
   */
  generate(name: string): CommonRequest {
    return {
      url: `${this.prefix}/generate`,
      method: 'post',
      params: { name }
    }
  },

  /**
   * 删除指定的 MCP API Key。
   * @param id API Key 主键ID
   */
  delete(id: IdType): CommonRequest {
    return {
      url: `${this.prefix}/delete`,
      method: 'post',
      params: { id }
    }
  },

  /**
   * 重命名指定的 MCP API Key。
   * @param id API Key 主键ID
   * @param name 新名称
   */
  rename(id: IdType, name: string): CommonRequest {
    return {
      url: `${this.prefix}/rename`,
      method: 'post',
      params: { id, name }
    }
  }
}