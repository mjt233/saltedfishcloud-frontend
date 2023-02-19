import { FileOpenHandler } from '../type'
import { reactive } from 'vue'
import defaultHandler from './defaultHandler'
import imagePreview from './imagePreview'
import playVideo from './playVideo'
import codeEdit from './codeEdit'
import markdownEdit from './markdownEdit'

const defaultFileOpenHandlers: FileOpenHandler[] = reactive([
  defaultHandler,
  imagePreview,
  playVideo,
  codeEdit,
  markdownEdit
])
export {
  defaultFileOpenHandlers
}