export interface WebDavServerConfig {
  /**
   * 是否允许匿名访问。默认为不允许
   */
  isAllowAnonymous?: boolean,

  /**
   * 是否启用WebDav服务。默认为不启用
   */
  isEnable?: boolean,

  /**
   * 服务地址
   */
  displayUrl: string
}