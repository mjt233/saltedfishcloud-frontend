import resource from 'sfc-common/api/resource'
import { type EventSupport, EventSupportImpl, Validators } from 'sfc-common/core'
import type { FileSystemHandler } from 'sfc-common/core/serivce/FileSystemHandler'
import type { FileInfo, FileListContext, IdType, ProtocolParams } from 'sfc-common/model'
import { StringUtils } from 'sfc-common/utils'
import { openDirDialog, openFileDialog } from 'sfc-common/utils/FileUtils/openFileDialog'
import SfcUtils from 'sfc-common/utils/SfcUtils'

export interface FileListContextDataSource {
  uid: IdType

  path: string

  protocol: string

  readonly: boolean

  fileList: FileInfo[]

  selectFileList: FileInfo[]

  enableFeature: string[] | 'all'

  protocolParams: () => ProtocolParams

  fileSystemHandler: () => FileSystemHandler
}

export type FileListContextEventRecord = {
  'refresh': [fileList: FileInfo[]]
}

export function createListContext(source: FileListContextDataSource):
  FileListContext &
  EventSupport<FileListContextEventRecord> &
  { syncDataSource(): void  } {
  const es = new EventSupportImpl<FileListContextEventRecord>()

  return {
    addEventListener(type, listener) {
      es.addEventListener(type, listener)
    },
    removeEventListener(type, listener) {
      es.removeEventListener(type, listener)
    },
    getAllEventListeners() {
      return es.getAllEventListeners()
    },
    uid: source.uid,
    path: source.path,
    readonly: source.readonly,
    protocol: source.protocol,
    enableFeature: [''],
    selectFileList: [],
    fileList: [],
    getProtocolParams() {
      return source.protocolParams()
    },
    getFileUrl(file) {
      const handler = source.fileSystemHandler()
      if (handler) {
        return handler.getFileUrl(source.path, file)
      } else if (file.md5) {
        return SfcUtils.getApiUrl(resource.downloadFileByMD5(file.md5, file.name))
      } else {
        throw new Error('无法获取文件url：' + file.name)
      }
    },
    getThumbnailUrl(file) {
      const handler = source.fileSystemHandler()
      return handler?.getCustomThumbnailUrl(source.path, file)
    },
    modelHandler: {
      async mkdir(name) {
        const handler = source.fileSystemHandler()
        await handler.mkdir(source.path, name)
        return name
      },
    
      async upload() {
        const handler = source.fileSystemHandler()
        const selectFile = await openFileDialog(true)
        for (let i = 0; i < selectFile.length; i++) {
          const file = selectFile[i]
          handler.uploadDirect(source.path, file)
        }
      },
    
      async uploadDir() {
        const handler = source.fileSystemHandler()
        Array.from(await openDirDialog()).forEach(f => {
          const path = StringUtils.appendPath(source.path, f.webkitRelativePath.substring(0, f.webkitRelativePath.length - f.name.length))
          handler.uploadDirect(path, f)
        })
      },
    
      async refresh() {
        const handler = source.fileSystemHandler()
        const list = await handler.loadList(source.path) as FileInfo[]
        list.forEach(e => e.path = source.path)
        es.dispatchEvent('refresh', list)
        return list
      },
      async rename(name, md5) {
        const newName = await SfcUtils.prompt({
          autofocus: true,
          title: '重命名',
          label: '新文件名',
          defaultValue: name,
          rules: [
            Validators.notNull('文件名不能为空'),
            (val: string) => {
              if (val === name) {
                return '不能与原文件名相同'
              } else {
                return true
              }
            }
          ]
        })
        await source.fileSystemHandler().rename(source.path, name, newName)
        this.refresh()
        return newName
      },
    
      async delete(name) {
        const handler = source.fileSystemHandler()
        return await handler.deleteFile(source.path, name) as number
      },
        
      async list(path) {
        const handler = source.fileSystemHandler()
        return await handler.loadList(path)
      },
    },
    
    syncDataSource() {
      this.uid = source.uid,
      this.path = source.path,
      this.readonly = source.readonly
      this.protocol = source.protocol
      this.enableFeature = source.enableFeature
      this.selectFileList = source.selectFileList
      this.fileList = source.fileList
    }
  }
}