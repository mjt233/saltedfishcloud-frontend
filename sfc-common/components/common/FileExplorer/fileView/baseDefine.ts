import type { MenuGroup } from 'sfc-common/core'
import type { FileInfo, FileListContext, IdType } from 'sfc-common/model'
import type { SelectItemKey } from 'vuetify/lib/util/index.mjs'

export interface FileExplorerViewEmits {
  (e: 'fileClick', file: FileInfo): void
  (e: 'fileRClick', file: FileInfo): void
  (e: 'fileSelect', file: string[]): void
}

export interface FileExplorerViewExpose {
  /**
   * 获取当前已选择的文件列表
   */
  getSelectedFileList(): FileInfo[]

  /**
   * 选择文件
   * @param fileName 选择的文件名列表
   */
  selectFile(fileName: string[]): void

  /**
   * 将指定文件滚动到视图内
   * @param fileName 文件名
   */
  scrollTo(fileName: string): void
}

export interface FileExplorerViewProps {
  /**
   * 是否只读
   */
  readOnly?: boolean
  /**
   * 文件列表
   */
  fileList: FileInfo[]

  /**
   * 文件列表所处的路径
   */
  path?: string

  /**
   * 列表菜单
   */
  menu?: MenuGroup<FileListContext>[]

  /**
   * 组件高度
   */
  height?: number

  /**
   * 是否显示挂载目录图表
   */
  showMountIcon?: boolean

  /**
   * 目标资源的所属用户id
   */
  uid?: IdType

  /**
   * 是否加载中
   */
  isLoading?: boolean

  /**
   * 是否启用多选功能
   */
  multipleSelect?: boolean

  /**
   * 访问的文件资源协议
   */
  protocol?: string
  
  /**
   * 目标资源的id
   */
  targetId?: IdType

  /**
   * 自定义缩略图URL生成函数
   * @param file 待生成缩略图的文件信息
   */
  customThumbnailUrl?: (file: FileInfo) => string

  /**
   * 文件项的唯一key(未完全实现, 目前只对FileExplorerTableView、FileExplorerListView布局有效)
   */
  itemKey?: SelectItemKey<Record<string, any> | FileInfo>

  /**
   * 文件项的选择值(未完全实现, 目前只对FileExplorerTableView布局有效)
   */
  itemValue?: SelectItemKey<FileInfo>
}