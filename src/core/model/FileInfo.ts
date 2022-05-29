import { FileListModel, FileListModelHandler } from './component/FileListModel'

export namespace FileTypeConstant {
  export const FILE = 2
  export const DIR = 1
}
export type FileType = 1|2
export interface FileInfo {
  uid: number
  md5: string
  node: string
  name: string
  size: number
  dir: boolean
  type: FileType
  createdAt: Date
  suffix: string
}

export interface FileTransferInfo {
  /** 文件所在目录 */
  source: string

  /** 被操作的多个文件 */
  filenames: string[]

  /** 要保存到的位置 */
  dest?: string
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
  uid?: number

  /** 文件列表是否只读 */
  readonly: boolean

  /** 文件列表操作器 */
  modelHandler: FileListModelHandler
}