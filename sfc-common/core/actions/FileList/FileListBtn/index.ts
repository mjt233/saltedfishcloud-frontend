import { reactive } from 'vue'
import offlineDownload from './offlineDownload'
import create from './create'
import { MenuGroup } from 'sfc-common/core/context'
import { FileListContext } from 'sfc-common/model'
const defaultFileBrowserTopBtns: MenuGroup<FileListContext>[] = reactive([
  create,
  offlineDownload
])
export {
  defaultFileBrowserTopBtns
}