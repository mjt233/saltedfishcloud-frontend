import { MenuItem } from 'sfc-common/core/context'
import { FileListContext } from 'sfc-common/model'

export interface FileListMenuItem extends MenuItem<FileListContext> {
  /** 是否仅限在工具栏显示 */
  onlyShowOnToolBar?: boolean

  /** 是否在工具栏中隐藏 */
  hideOnToolBar?: boolean
}
