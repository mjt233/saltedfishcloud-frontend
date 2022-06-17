import { FileListContext, FileInfo } from '@/core/model'

export interface FileListEmits {
  (event: 'clickItem', ctx: FileListContext ,item: FileInfo): void,
  (event: 'back'): void,
  (event: 'refresh'): void,
  (event: 'update:file-list', fileList: FileInfo[]): void
}