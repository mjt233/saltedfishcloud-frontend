import { AuditModel } from './Common'

export interface ThirdPartyAuthPlatform extends AuditModel {
  /**
   * 平台类型
   */
  type: string

  /**
   * 平台名称
   */
  name: string

  /**
   * 平台图标
   */
  icon: string

  /**
   * 是否启用
   */
  isEnable: boolean

  /**
   * 平台参数配置
   */
  config: string

  /**
   * 是否允许注册新用户
   */
  isAllowRegister: true
}