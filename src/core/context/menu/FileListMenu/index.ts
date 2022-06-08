import { FileListContext } from '@/core/model'
import { MenuGroup } from '../type.d'
import addGroup from './Add'
import commonGroup from './Common'
import fileActionGroup from './FileAction'
const defaultFileListMenu: MenuGroup<FileListContext>[] = [
  addGroup,
  commonGroup,
  fileActionGroup
]

export {
  defaultFileListMenu
}