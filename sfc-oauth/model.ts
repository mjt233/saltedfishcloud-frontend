/**
 * 权限项
 */
export interface AuthorityItem {
  /** 权限代码 */
  code: string

  /** 权限名称 */
  name: string

  /** 详细描述 */
  describe: string

  /** 权限图标 */
  icon: string

  /**
   * 是否为危险敏感权限
   */
  isDanger?: boolean
}