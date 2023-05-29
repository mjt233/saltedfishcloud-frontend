import { FileListContext } from 'sfc-common/model'
import { reactive } from 'vue'
import { MenuGroup } from 'sfc-common/core/context/menu/type'
import addGroup from './Add'
import commonGroup from './Common'
import fileActionGroup from './FileAction'
import otherGroup from './Other'
const defaultFileListMenu: MenuGroup<FileListContext>[] = reactive([
  addGroup,
  commonGroup,
  otherGroup,
  fileActionGroup
])

export {
  defaultFileListMenu
}