export type ProxyType = 'SOCKS' | 'HTTP'

export interface ProxyBaseInfo {
  /** 代理名称，也是唯一标识 */
  name: string
}

export interface ProxyInfo extends ProxyBaseInfo {
  name: string

  /** 代理类型 */
  type: ProxyType

  /** 代理服务器地址 */
  address: string

}