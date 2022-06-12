import { DiskFileUploadService, fileUploadTaskManager } from './FileUpload'
import API from '@/api'
import SfcUtils from '@/utils/SfcUtils'
import { Ref } from 'vue'
import { FileInfo } from '../model'

export interface FileSystemHandler {
  /**
   * 获取文件列表
   * @param uid 用户ID
   * @param path 目录路径
   */
  loadList(path: string): Promise<FileInfo[]>

  /**
   * 创建文件夹
   * @param uid 用户ID
   * @param path 文件夹所在目录
   * @param name 文件夹名称
   */
  mkdir(path: string, name: string): Promise<null>

  /**
   * 删除文件
   * @param uid 用户ID
   * @param path 文件所在路径
   * @param names 待删除的文件名列表
   */
  deleteFile(path: string, names: string[]): Promise<number>

  /**
   * 直接上传完整文件到网盘中
   * @param uid   用户ID
   * @param path  文件所在路径
   * @param file  待上传的文件
   * @returns 1 - 新文件，0 - 旧文件覆盖
   */
  uploadDirect(path: string, file: File): Promise<any>

  /**
   * 对文件进行重命名操作
   * @param path 文件所在路径
   * @param oldName 原文件名
   * @param newName 新文件名
   */
  rename(path: string, oldName: string, newName: string): Promise<string>
}

export class DefaultFileSystemHandler implements FileSystemHandler {
  uid: Ref<number>
  
  constructor(uid: Ref<number>) {
    this.uid = uid
  }
  async rename(path: string, oldName: string, newName: string): Promise<string> {
    await SfcUtils.request(API.file.rename(this.uid.value, path, oldName, newName))
    return newName
  }
  async loadList(path: string): Promise<FileInfo[]> {
    const res = (await SfcUtils.request(API.file.getFileList(this.uid.value, path))).data.data
    return res[0].concat(res[1])
  }

  async mkdir(path: string, name: string): Promise<null> {
    return (await SfcUtils.request(API.file.mkdir(this.uid.value, path, name))).data.data
  }

  async deleteFile(path: string, names: string[]): Promise<number> {
    return (await SfcUtils.request(API.file.delete(this.uid.value, path, names))).data.data
  }
  

  async uploadDirect(path: string, file: File): Promise<any> {
    const executor = DiskFileUploadService.uploadToDisk(this.uid.value, path, file)
    fileUploadTaskManager.addExecutor(executor)
    executor.onFinally(() => {
      console.log(`文件${file.name}完成上传`)
    })
  }
}

export class FileSystemHandlerFactory {
  public static getFileSystemHandler(uid: Ref<number>): FileSystemHandler {
    return new DefaultFileSystemHandler(uid)
  }
}