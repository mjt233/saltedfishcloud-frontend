import type { FileInfo, FileSystemHandler, IdType } from 'sfc-common'
import { DiskFileUploadService, fileUploadTaskManager, StringUtils } from 'sfc-common'

/**
 * 团队空间文件系统处理器。
 * <p>
 * 实现宿主 {@link FileSystemHandler} 接口，全部操作经运行时全局 window.API
 * 调用核心文件端点（/api/diskFile/{teamUid} 系列，团队角色鉴权由核心 SPI 放行），
 * 供宿主 FileExplorer 组件直接渲染团队空间文件浏览。
 */
export class TeamFileSystemHandler implements FileSystemHandler {

  /**
   * 团队文件空间 uid（团队 id）
   */
  private readonly uid: IdType

  /**
   * 构造团队文件系统处理器
   * @param uid 团队文件空间 uid
   */
  constructor(uid: IdType) {
    this.uid = uid
  }

  /**
   * 获取运行时宿主 API 对象
   */
  private get api() {
    return (window as any).API
  }

  /**
   * 获取运行时宿主 SfcUtils 对象
   */
  private get utils() {
    return (window as any).SfcUtils
  }

  /**
   * 获取文件下载/预览 URL
   * <p>
   * 主文件系统非挂载文件按 md5 取文件（无 uid 闸门）；其余走 main 协议资源接口
   * @param path 文件所在目录路径
   * @param file 文件信息
   */
  getFileUrl(path: string, file: FileInfo) {
    if (!file.isMount && file.md5) {
      return this.utils.getApiUrl(this.api.resource.downloadFileByMD5(file.md5, file.name))
    }
    return this.utils.getApiUrl(this.api.resource.getCommonResource({
      name: file.name,
      path: path,
      protocol: 'main',
      targetId: this.uid
    }))
  }

  /**
   * 获取缩略图自定义 URL
   * <p>
   * 返回 undefined 表示使用宿主默认的按 md5 取缩略图逻辑（FileIcon 内置），
   * 仅挂载文件返回 main 协议缩略图资源地址
   * @param path 文件所在目录路径
   * @param file 文件信息
   */
  getCustomThumbnailUrl(path: string, file: FileInfo) {
    if (file.isMount) {
      return this.utils.getApiUrl(this.api.resource.getCommonResource({
        isThumbnail: true,
        name: file.name,
        path: path,
        protocol: 'main',
        targetId: this.uid
      }))
    }
    return undefined
  }

  /**
   * 加载文件列表
   * @param path 目录路径
   */
  async loadList(path: string): Promise<FileInfo[]> {
    const res = await this.utils.request(this.api.file.getFileList(this.uid, path))
    const data = res.data.data as FileInfo[][]
    return (data[0] || []).concat(data[1] || [])
  }

  /**
   * 创建目录
   * @param path 所在目录路径
   * @param name 目录名
   */
  async mkdir(path: string, name: string): Promise<null> {
    await this.utils.request(this.api.file.mkdir(this.uid, path, name))
    return null
  }

  /**
   * 删除文件/目录
   * @param path 所在目录路径
   * @param names 文件名列表
   */
  async deleteFile(path: string, names: string[]): Promise<number> {
    const res = await this.utils.request(this.api.file.delete(this.uid, path, names))
    return res.data.data as number
  }

  /**
   * 直接上传完整文件到团队空间
   * <p>
   * 复用宿主 {@link DiskFileUploadService} 执行器式上传，与【我的网盘/公共网盘】一致：
   * 计算 MD5 摘要（含进度）→ 尝试秒传 → 实时上报上传进度并纳入全局上传列表展示
   * @param path 目标目录路径
   * @param file 待上传文件
   */
  async uploadDirect(path: string, file: File): Promise<string> {
    const executor = DiskFileUploadService.uploadToDisk(this.uid, path, file)
    return new Promise((resolve, reject) => {
      executor.onSuccess(() => {
        resolve(StringUtils.appendPath(path, file.name))
      })
      executor.onError(reject)
      fileUploadTaskManager.addExecutor(executor)
    })
  }

  /**
   * 重命名文件
   * @param path 所在目录路径
   * @param oldName 原文件名
   * @param newName 新文件名
   */
  async rename(path: string, oldName: string, newName: string): Promise<string> {
    await this.utils.request(this.api.file.rename(this.uid, path, oldName, newName))
    return newName
  }
}
