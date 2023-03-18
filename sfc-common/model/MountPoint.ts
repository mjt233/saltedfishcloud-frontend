import { ConfigNodeModel } from './Common'

/**
 * 文件系统参数描述
 */
export interface DiskFileSystemDescribe {
  name: string
  protocol: string
  describe: string
  configNode: ConfigNodeModel[]
}

export interface MountPoint {
  /** 挂载点id */
  id?: string

  /** 所属用户id */
  uid: string

  /** 挂载点所在目录的id */
  nid: string

  /** 挂载的目标文件系统协议 */
  protocol: string

  /** 文件系统挂载参数json */
  params: string

  /** 挂载点名称 */
  name: string

}