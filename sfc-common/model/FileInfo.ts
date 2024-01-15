import { AuditModel } from './Common'
import { IdType } from './index'
import { FileListModel, FileListModelHandler } from './component/FileListModel'

export namespace FileTypeConstant {
  export const FILE = 2
  export const DIR = 1
}
export type FileType = 1|2
export interface FileInfo extends AuditModel {
  md5: string
  node: string
  name: string
  size: number
  dir: boolean
  type: FileType
  suffix: string
  mountId: string
  ctime: string
  mtime: string
  /* 是否来自挂载的文件系统 */
  mount: boolean

  /* 所处路径 */
  path?: string
}

export interface SearchFileInfo extends FileInfo {
  parent: string
}

export interface FileItemTransferParam {
  /** 文件原位置 */
  source: string

  /** 文件目标位置 */
  target: string
}
export interface FileTransferParam {

  /** 被操作的多个文件 */
  files: FileItemTransferParam[]

  /** 文件传输到的目标uid */
  targetUid: number

  /** 文件来源uid */
  sourceUid: number
}

export interface FileTransferInfo {
  source: string,
  filenames: string[],
  dest?: string
}

/**
 * 获取访问协议资源的额外参数，如：文件分享需要vid，提取码等参数
 */
export interface ProtocolParams {
  /** 资源id */
  id: IdType
  [key:string]:any
}
export interface FileListContext {
  /** 整个文件列表的所有文件 */
  fileList: FileInfo[]

  /** 已选择的文件列表 */
  selectFileList: FileInfo[]

  /** 启用的文件列表特性 */
  enableFeature: string[] | 'all'

  /** 文件列表名称 */
  name?: string

  /** 该列表所展示的文件的用户id */
  uid: IdType

  /** 文件列表是否只读 */
  readonly: boolean

  /** 文件列表路径 */
  path: string

  /** 文件列表操作器 */
  modelHandler: FileListModelHandler

  /** 获取文件的下载url */
  getFileUrl: (file: FileInfo) => string | undefined

  /** 获取文件缩略图的下载url */
  getThumbnailUrl: (file: FileInfo) => string | undefined,

  /** 文件列表的网盘资源访问协议 */
  protocol: string,

  /** 获取访问协议资源的额外参数，如：文件分享需要vid，提取码等参数 */
  getProtocolParams: () => ProtocolParams
}