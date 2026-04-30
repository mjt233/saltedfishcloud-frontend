import { FileOpenHandler } from '../type'
import { reactive } from 'vue'
import defaultHandler from './defaultHandler'
import imagePreview from './imagePreview'
import imageViewer from './imageViewer'
import playVideo from './playVideo'
import codeEdit from './codeEdit'
import markdownEdit from './markdownEdit'
import viewArchive from './viewArchive'

const defaultFileOpenHandlers: FileOpenHandler[] = reactive([
  defaultHandler,
  imageViewer,
  // imagePreview,
  playVideo,
  viewArchive,
  codeEdit,
  markdownEdit
])
export {
  defaultFileOpenHandlers
}