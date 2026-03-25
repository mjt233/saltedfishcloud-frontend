import { FileListContext } from 'sfc-common/model'
import { reactive } from 'vue'
import { MenuGroup, MenuItem } from 'sfc-common/core/context/menu/type'
import addGroup from './Add'
import commonGroup from './Common'
import fileActionGroup from './FileAction'
import otherGroup from './Other'
import { FileListMenuItem } from './type'
const defaultFileListMenu: MenuGroup<FileListContext, FileListMenuItem>[] = reactive([
  addGroup,
  commonGroup,
  otherGroup,
  fileActionGroup
])

export {
  defaultFileListMenu
}