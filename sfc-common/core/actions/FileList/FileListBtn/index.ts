import { reactive } from 'vue'
import { createMenuGroup } from './create'
import { MenuGroup } from 'sfc-common/core/context'
import { FileListContext } from 'sfc-common/model'
import { uploadMenuGroup } from './upload'
import { mountMenuGroup } from './mount'
const defaultFileBrowserTopBtns: MenuGroup<FileListContext>[] = reactive([
  uploadMenuGroup,
  createMenuGroup,
  mountMenuGroup
])
export {
  defaultFileBrowserTopBtns
}