import FileUtils from '@/utils/FileUtils'
import { ExtractPropTypes, reactive, Ref } from 'vue'
import { FileListContext, FileInfo } from '@/core/model'
import propsOptions from './props'
import { FileSystemHandler } from '@/core/serivce/FileSystemHandler'

export interface FileListContextBuilderOptions {
  props: Readonly<ExtractPropTypes<typeof propsOptions>>,
  emits: any
  handler: Ref<FileSystemHandler> | undefined,
  rename(name: string, md5: string): Promise<string>
}

const FileListContextBuilder = {
  getFileListContext(opt: FileListContextBuilderOptions): FileListContext {
    const { props, emits, handler, rename} = opt
    return reactive({
      uid: props.uid,
      fileList: props.fileList,
      enableFeature: [''],
      readonly: props.readOnly,
      name: '',
      selectFileList: [],
      path: props.path,
      modelHandler: {
        async mkdir(name) {
          await handler?.value.mkdir(props.path, name)
          return name
        },
    
        async upload() {
          const selectFile = await FileUtils.openFileDialog(true)
          for (let i = 0; i < selectFile.length; i++) {
            const file = selectFile[i]
            handler?.value.uploadDirect(props.path, file)
          }
        },
    
        async refresh() {
          const list = await handler?.value.loadList(props.path) as FileInfo[]
          emits('update:file-list', list)
          return list
        },
        rename,
    
        async delete(name) {
          return await handler?.value.deleteFile(props.path, name) as number
        }
      }
    })
  }
}

export default FileListContextBuilder