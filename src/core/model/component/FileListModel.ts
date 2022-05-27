import { ComponentPublicInstance } from 'vue'
import { FileInfo } from '../FileInfo'
export interface FileListModelHandler {
  /**
   * 通知列表执行新建文件夹
   * @returns 若完成创建，则返回文件夹名称
   */
  mkdir: () => Promise<string>

  /**
   * 通知列表触发选择文件上传
   */
  upload: () => Promise<FileList>

  /** 
   * 通知列表执行加载
   * @returns 若加载成功，则返回文件列表
   */
  loadList: () => Promise<FileInfo[]>
}
export type FileListModel = ComponentPublicInstance & FileListModelHandler