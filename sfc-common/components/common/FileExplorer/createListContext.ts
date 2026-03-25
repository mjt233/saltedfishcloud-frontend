import resource from 'sfc-common/api/resource'
import { type EventSupport, EventSupportImpl, Validators } from 'sfc-common/core'
import type { FileSystemHandler } from 'sfc-common/core/serivce/FileSystemHandler'
import type { FileInfo, FileListContext, IdType, ProtocolParams } from 'sfc-common/model'
import { FileListModel, FileListModelHandler } from 'sfc-common/model/component/FileListModel'
import { StringUtils } from 'sfc-common/utils'
import { openDirDialog, openFileDialog } from 'sfc-common/utils/FileUtils/openFileDialog'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { markRaw, reactive, Ref, type Component, type VNode } from 'vue'

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
  /** 通过上下文对象操作了列表刷新 */
  'refresh': [fileList: FileInfo[]]
}

type ComponentType = string | Component | (() => VNode)
export interface FileExplorerSideSupport {
  /**
   * 是否启用了侧边栏
   */
  isEnabled: boolean

  /**
   * 侧边栏组件
   */
  sideComponent?: ComponentType

  /**
   * 侧边栏属性
   */
  sideProps?: Record<string, any>

  /**
   * 侧边栏标题
   */
  sideTitle?: string

  /**
   * 设置侧边栏组件
   * @param component 要设置的组件
   * @param props 给组件传入的属性
   */
  setSide(component?: ComponentType, props?: Record<string, any>, title?: string): void
}

export function useSideSupport() {
  return reactive({
    isEnabled: false,
    sideComponent: undefined,
    sideProps: undefined,
    setSide(component?: ComponentType, props?: Record<string, any>, title?: string) {
      if (!component) {
        this.sideComponent = component
        this.sideProps = props
        return
      }
      this.sideTitle = title
      this.sideComponent = typeof component === 'object' 
        ? markRaw(component) 
        : component
      this.sideProps = props

    }
  } as FileExplorerSideSupport)
}

/**
 * FileExplorer文件数据操纵对象
 */
export class FileExplorerModelHandler implements FileListModelHandler {
  
  /**
   * @param source 文件浏览器的文件列表上下文数据源
   * @param es 文件浏览器的事件支持对象
   */
  constructor(private source: FileListContextDataSource, private es: EventSupportImpl<FileListContextEventRecord>) {

  }

  
  async mkdir(name: string) {
    const handler = this.source.fileSystemHandler()
    await handler.mkdir(this.source.path, name)
    return name
  }
    
  async upload() {
    const handler = this.source.fileSystemHandler()
    const selectFile = await openFileDialog(true)
    for (let i = 0; i < selectFile.length; i++) {
      const file = selectFile[i]
      handler.uploadDirect(this.source.path, file)
    }
  }
    
  async uploadDir() {
    const handler = this.source.fileSystemHandler()
    Array.from(await openDirDialog()).forEach(f => {
      const path = StringUtils.appendPath(this.source.path, f.webkitRelativePath.substring(0, f.webkitRelativePath.length - f.name.length))
      handler.uploadDirect(path, f)
    })
  }
    
  async refresh() {
    const handler = this.source.fileSystemHandler()
    const list = await handler.loadList(this.source.path) as FileInfo[]
    list.forEach(e => e.path = this.source.path)
    this.es.dispatchEvent('refresh', list)
    return list
  }
  async rename(name: string, md5: string) {
    const newName = await SfcUtils.prompt({
      autofocus: true,
      title: '重命名',
      label: '新文件名',
      defaultValue: name,
      onMounted(inst) {
        const idx = name.lastIndexOf('.')
        if (idx != -1) {
          const input = inst.getComponentInstRef().$el.querySelector('input') as HTMLInputElement
          input.focus()
          input.setSelectionRange(0, idx)
        }
      },
      rules: [
        Validators.notNull('文件名不能为空'),
        (val: string) => {
          if (val === name) {
            return '不能与原文件名相同'
          } else {
            return true
          }
        }
      ],
    })
    await this.source.fileSystemHandler().rename(this.source.path, name, newName)
    this.refresh()
    return newName
  }
    
  async delete(name: string[]) {
    const handler = this.source.fileSystemHandler()
    return await handler.deleteFile(this.source.path, name) as number
  }
        
  async list(path: string) {
    const handler = this.source.fileSystemHandler()
    return await handler.loadList(path)
  }
}

/**
 * FileExplorer文件列表上下文对象
 */
export class FileExplorerContext implements FileListContext, EventSupport<FileListContextEventRecord> {

  private es = new EventSupportImpl<FileListContextEventRecord>()
  public uid: IdType
  public path: string
  public readonly: boolean
  public protocol: string
  public enableFeature: string[] | 'all'
  public selectFileList: FileInfo[]
  public fileList: FileInfo[]
  public name?: string | undefined
  public modelHandler: FileListModelHandler
  public sideSupport: FileExplorerSideSupport = useSideSupport()

  constructor(private source: FileListContextDataSource) {
    this.uid = source.uid,
    this.path = source.path,
    this.readonly = source.readonly
    this.protocol = source.protocol
    this.enableFeature = source.enableFeature
    this.selectFileList = source.selectFileList
    this.fileList = source.fileList
    this.modelHandler = new FileExplorerModelHandler(source, this.es)
    this.syncDataSource()
  }
  getFileUrl(file: FileInfo) {
    
    const handler = this.source.fileSystemHandler()
    if (handler) {
      return handler.getFileUrl(this.source.path, file)
    } else if (file.md5) {
      return SfcUtils.getApiUrl(resource.downloadFileByMD5(file.md5, file.name))
    } else {
      throw new Error('无法获取文件url：' + file.name)
    }
  }
  getThumbnailUrl(file: FileInfo) {
    const handler = this.source.fileSystemHandler()
    return handler?.getCustomThumbnailUrl(this.source.path, file)
  }

  getProtocolParams() {
    return {
      name: '',
      path: this.source.path,
      protocol: this.source.protocol,
      targetId: this.source.uid,
      ...this.source.protocolParams()
    }
  }

  syncDataSource() {
    this.uid = this.source.uid,
    this.path = this.source.path,
    this.readonly = this.source.readonly
    this.protocol = this.source.protocol
    this.enableFeature = this.source.enableFeature
    this.selectFileList = this.source.selectFileList
    this.fileList = this.source.fileList
  }

  addEventListener<T extends 'refresh'>(type: T, listener: (...args: FileListContextEventRecord[T]) => void): void {
    this.es.addEventListener(type, listener)
  }
  removeEventListener<T extends 'refresh'>(type: T, listener: (...args: FileListContextEventRecord[T]) => void): void {
    this.es.removeEventListener(type, listener)
  }

  protected dispatchEvent<T extends 'refresh'>(type: T, ...args: FileListContextEventRecord[T]) {
    this.es.dispatchEvent(type, ...args)
  }

  getAllEventListeners<T extends 'refresh'>(): { type: T; listener: Function }[] {
    return this.es.getAllEventListeners()
  }
}

export function createListContext(source: FileListContextDataSource): FileExplorerContext {
  return new FileExplorerContext(source)
}