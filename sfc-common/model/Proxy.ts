import { AuditModel } from './Common'

export type ProxyType = 'SOCKS' | 'HTTP'

export interface ProxyBaseInfo extends AuditModel {
  /** 代理名称 */
  name: string
}

export interface ProxyInfo extends ProxyBaseInfo {
  name: string

  /** 代理类型 */
  type: ProxyType

  /** 代理服务器地址 */
  address: string

  /** 代理服务器端口 */
  port: number

  /** 连通性测试用url */
  testUrl: string
}