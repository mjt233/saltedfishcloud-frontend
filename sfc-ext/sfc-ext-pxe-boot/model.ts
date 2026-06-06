/**
 * PXE 启动插件数据模型
 */

/**
 * 启动项类型
 */
export type BootItemType = 'ISO' | 'DIRECTORY' | 'KERNEL_INITRD'

/**
 * ISO 启动方式
 */
export type IsoBootMethod = 'MEMDISK' | 'KERNEL' | 'WIMBOOT' | 'SANBOOT'

/**
 * 启动项
 */
export interface BootItem {
  id: number
  uid: number
  displayName: string
  itemKey: string
  type: BootItemType
  resourcePath: string
  kernelFilename?: string
  initrdFilename?: string
  kernelParams?: string
  enabled: boolean
  sortOrder: number
  description?: string
  isoBootMethod?: IsoBootMethod
  createAt?: string
  updateAt?: string
}

/**
 * 启动项表单数据
 */
export interface BootItemForm {
  displayName: string
  itemKey: string
  type: BootItemType
  resourcePath: string
  kernelFilename: string
  initrdFilename: string
  kernelParams: string
  enabled: boolean
  sortOrder: number
  description: string
  isoBootMethod: IsoBootMethod | ''
}

/**
 * PXE 服务状态
 */
export interface PxeServiceStatus {
  tftpRunning: boolean
  httpRunning: boolean
  proxyDhcpRunning: boolean
  tftpPort: number
  httpPort: number
  activeBootItems: number
  activeSessions: number
  lastError?: string
}

/**
 * PXE 会话信息
 */
export interface PxeSessionInfo {
  clientIp: string
  lastRequestPath: string
  lastActiveTime: number
  totalBytesTransferred: number
  requestCount: number
}

/**
 * 创建默认启动项表单
 */
export function createDefaultBootItemForm(): BootItemForm {
  return {
    displayName: '',
    itemKey: '',
    type: 'KERNEL_INITRD',
    resourcePath: '',
    kernelFilename: 'vmlinuz',
    initrdFilename: 'initrd.img',
    kernelParams: '',
    enabled: true,
    sortOrder: 0,
    description: '',
    isoBootMethod: 'KERNEL'
  }
}
