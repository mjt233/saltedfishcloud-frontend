import { ComponentPublicInstance } from 'vue'
import { FileInfo, FileListContext } from '../FileInfo'
export interface FileListModelHandler {
  /**
   * 通知列表执行新建文件夹
   * @returns 若完成创建，则返回文件夹名称
   */
  mkdir: (name: string) => Promise<string>

  /**
   * 通知列表触发选择文件上传
   */
  upload: () => Promise<any>

  /** 
   * 通知列表执行加载
   * @returns 若加载成功，则返回文件列表
   */
  refresh: () => Promise<FileInfo[] | undefined>

  /**
   * 发起文件重命名流程
   * @param name 原文件名
   * @param md5  被修改文件名的md5
   * @returns 修改后的名称
   */
  rename: (name: string, md5: string) => Promise<string>

  /**
   * 删除列表中的文件
   * @param name 被删除的文件名列表集合
   * @returns 删除的文件数量
   */
  delete: (name: string[]) => Promise<number> 
}
export interface FileListModel extends ComponentPublicInstance {
  context: FileListContext
}