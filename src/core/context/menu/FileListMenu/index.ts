import { FileListContext } from '@/core/model'
import { MenuGroup } from '../type.d'
import addGroup from './Add'
import commonGroup from './Common'
import fileActionGroup from './FileAction'
import otherGroup from './Other'
const defaultFileListMenu: MenuGroup<FileListContext>[] = [
  addGroup,
  commonGroup,
  otherGroup,
  fileActionGroup
]

export {
  defaultFileListMenu
}