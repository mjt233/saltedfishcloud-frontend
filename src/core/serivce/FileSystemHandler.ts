import { DiskFileUploadService, fileUploadTaskManager } from './FileUpload'
import API from '@/api'
import SfcUtils from '@/utils/SfcUtils'
import { Ref } from 'vue'
import { FileInfo, IdType } from '../model'
import { ShareInfo } from '@/api/share'
import { ShareService } from './ShareService'

export interface FileSystemHandler {
  
  getFileUrl: (path: string, file: FileInfo) => string
  /**
   * 获取缩略图自定义url
   * 若返回undefined则表示使用默认根据md5获取
   */
  getCustomThumbnailUrl: (path:string, file: FileInfo) => string | undefined
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
  uid: Ref<IdType>
  
  constructor(uid: Ref<IdType>) {
    this.uid = uid
  }
  getFileUrl(path: string, file: FileInfo) {
    if (!file.mount) {
      // 在主文件系统的非挂载目录中的文件浏览直接使用按md5获取
      return SfcUtils.getApiUrl(API.resource.downloadFileByMD5(file.md5, file.name))
    } else {
      return SfcUtils.getApiUrl(API.resource.getCommonResource({
        name: file.name,
        path: path,
        protocol: 'main',
        targetId: this.uid.value
      }))
    }
  }
  getCustomThumbnailUrl(path: string, file: FileInfo) {
    if (!file.mount) {
      // 在主文件系统的非挂载目录中的文件浏览直接使用缩略图组件内置的路径
      return undefined
    } else {
      return SfcUtils.getApiUrl(API.resource.getCommonResource({
        isThumbnail: true,
        name: file.name,
        path: path,
        protocol: 'main',
        targetId: this.uid.value
      }))
    }
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
  }

  
}

export class FileSystemHandlerFactory {
  public static getFileSystemHandler(uid: Ref<IdType>): FileSystemHandler {
    return new DefaultFileSystemHandler(uid)
  }

  public static getShareFileSystemhandler(shareInfo: ShareInfo): FileSystemHandler {
    return new ShareService.ShareFileSystemHandler(shareInfo)
  }
}