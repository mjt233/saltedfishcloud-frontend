import { reactive } from 'vue'
import offlineDownload from './offlineDownload'
import create from './create'
import { MenuGroup } from '@/core/context'
import { FileListContext } from '@/core/model'
const defaultFileBrowserTopBtns: MenuGroup<FileListContext>[] = reactive([
  create,
  offlineDownload
])
export {
  defaultFileBrowserTopBtns
}