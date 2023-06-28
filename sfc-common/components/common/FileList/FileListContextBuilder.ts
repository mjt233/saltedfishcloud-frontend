import FileUtils from 'sfc-common/utils/FileUtils'
import { ExtractPropTypes, reactive, Ref } from 'vue'
import { FileListContext, FileInfo, ProtocolParams } from 'sfc-common/model'
import propsOptions from './props'
import { FileSystemHandler } from 'sfc-common/core/serivce/FileSystemHandler'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import API from 'sfc-common/api'

export interface FileListContextBuilderOptions {
  props: Readonly<ExtractPropTypes<typeof propsOptions>>,
  emits: any
  handler: Ref<FileSystemHandler> | undefined,
  rename(name: string, md5: string): Promise<string>,
  protocol: string,
  protocolParams: () => ProtocolParams
}

const FileListContextBuilder = {
  getFileListContext(opt: FileListContextBuilderOptions): FileListContext {
    const { props, emits, handler, rename} = opt
    return reactive({
      protocol: opt.protocol,
      uid: props.uid,
      fileList: props.fileList,
      enableFeature: [''],
      readonly: props.readOnly,
      name: '',
      selectFileList: [],
      path: props.path,
      getProtocolParams() {
        return opt.protocolParams()
      },
      getFileUrl(file) {
        if (handler) {
          return handler?.value.getFileUrl(props.path, file)
        } else if (file.md5) {
          return SfcUtils.getApiUrl(API.resource.downloadFileByMD5(file.md5, file.name))
        } else {
          console.error('无法获取该文件的url：',file)
          throw new Error('无法获取文件url：' + file.name)
          
        }
      },
      getThumbnailUrl(file) {
        return handler?.value.getCustomThumbnailUrl(props.path, file)
      },
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
          list.forEach(e => e.path = props.path)
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