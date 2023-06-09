import { AuditModel } from 'sfc-common'

export interface WolDevice extends AuditModel {
  /**
   * 设备命名
   */
  name: string

  /**
   * mac地址
   */
  mac: string

  /**
   * IP地址
   */
  ip: string

  /**
   * 端口
   */
  port: number

  /**
   * 上次发送唤醒的时间
   */
  lastWakeAt: string

  /**
   * 设备是否在线
   */
  isOnline: boolean

  /**
   * 排序
   */
  showOrder: number
}

export interface NetworkInterfaceInfo {
  /**
   * 网络接口名称
   */
  name: string

  /**
   * 网卡显示名称
   */
  displayName: string

  /**
   * MAC地址
   */
  mac: string

  /**
   * IP地址
   */
  ipList: string[]

  /**
   * 广播地址
   */
  broadcastAddressList: string[]

  /**
   * 接口索引
   */
  index: number

  mtu: number

}