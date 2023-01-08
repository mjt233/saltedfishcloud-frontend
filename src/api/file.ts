import { FileTransferInfo, SearchFileInfo } from './../core/model/FileInfo'
import { CommonRequest, FileInfo, FileTransferParam,IdType, PageInfo } from '@/core/model'
import { useJsonBody } from '@/utils/FormUtils/CommonFormUtils'
import { StringUtils } from '@/utils/StringUtils'

// const { useJsonBody } = require('@/utils/FormUtils/CommonFormUtils')
// const StringUtils = require('@/utils/StringUtils')

const file = {
  prefix: 'diskFile',
  /**
   * 文件快速保存（秒传）
   * @param {Number} uid 用户ID
   * @param {String} path 文件保存的目录
   * @param {String} name 文件名
   * @param {String} md5 文件MD5
   * @returns 是否保存成功
   */
  quickSave(uid: IdType, path: string, name: string, md5: string): CommonRequest<Boolean> {
    return {
      url: `${this.prefix}/${uid}/quickSave`,
      method: 'post',
      data: {
        path: path,
        name: name,
        md5: md5
      }
    }
  },
  /**
   * 下载打包的资源（需要在浏览器中打开url）
   * @param {String} wid 打包标识符
   * @param {String} alias 别名
   * @returns {import('axios').AxiosRequestConfig}
   */
  downloadWrap(wid: string, alias: string) {
    return {
      url: `/${this.prefix}/0/wrap/${wid}${alias ? '/' + alias : ''}`
    }
  },
  /**
   * 创建打包下载标识符
   * @param {Number} uid 用户ID
   * @param {FileTransferObj} fileTransferObj 文件操作对象，dest不要求
   * @returns 打包id
   */
  createWrap(uid: IdType, fileTransferObj: FileTransferInfo): CommonRequest<string> {
    return useJsonBody({
      url: `/${this.prefix}/${uid}/wrap`,
      method: 'post',
      data: fileTransferObj
    })
  },
  /**
   * 在网盘中创建压缩文件
   * @param {Number} uid 用户ID
   * @param {FileTransferObj} fileTransferObj 文件操作对象
   * @returns {import('axios').AxiosRequestConfig}
   */
  compress(uid: IdType, fileTransferObj: FileTransferInfo): CommonRequest {
    return useJsonBody({
      url: `/${this.prefix}/${uid}/compress`,
      method: 'post',
      data: fileTransferObj
    })
  },
  /**
   * 搜索文件
   * @param {String} uid 用户ID
   * @param {String} key 关键字
   * @param {Number} [page = 1] 页码
   * @returns
   */
  search(uid: IdType, key: string, page: number = 1): CommonRequest<PageInfo<SearchFileInfo>> {
    return {
      url: `${this.prefix}/${uid}/fileList/byName/${key}`,
      method: 'get',
      params: {
        page: page
      }
    }
  },
  copy(param: FileTransferParam): CommonRequest {
    return useJsonBody({
      method: 'post',
      url: `/${this.prefix}/${param.sourceUid}/copy`,
      data: param
    })
  },
  move(param: FileTransferParam): CommonRequest {
    return useJsonBody({
      method: 'post',
      url: `/${this.prefix}/${param.sourceUid}/move`,
      data: param
    })
  },
  /**
   * 取文件列表
   * @param {String} uid 用户ID
   * @param {String} path 路径
   * @returns 下标0 - 目录，下标1 - 文件
   */
  getFileList(uid: IdType, path: string): CommonRequest<FileInfo[][]> {
    if (path == '/') path = ''
    path = StringUtils.encodeURLPath(path)
    return {
      url: `/${this.prefix}/${uid}/fileList/byPath/${path}`.replaceAll(/\/\/+/g, '/'),
      method: 'get'
    }
  },
  /**
   * 创建文件夹
   * @param {String} uid 用户ID
   * @param {String} path 所在文件夹路径
   * @param {String} name 文件夹名
   * @returns
   */
  mkdir(uid: IdType, path: string, name: string): CommonRequest {
    if (path == '/') path = ''
    let url = StringUtils.appendPath(`/${this.prefix}/${uid}/dir`, path)
    url = url.replace(/\/\/+/g, '/')
    return {
      url: url,
      method: 'put',
      data: {
        name: name
      }
    }
  },
  /**
   * 上传文件
   * @param {Number} uid 用户ID
   * @param {String} path 资源路径
   * @param {File} file 文件
   * @param {String} md5 文件MD5
   * @returns 新文件- 1，覆盖旧文件 - 0
   */
  upload(uid: IdType, path: string, file: File | undefined | null, md5: string): CommonRequest<number> {
    path = path.split('/').map(e => encodeURIComponent(e)).join('/')
    const fd = new FormData()
    fd.set('md5', md5)
    if (file) {

      fd.set('file', file)
    }
    return {
      url: StringUtils.appendPath(`/${this.prefix}/${uid}/file`, path),
      method: 'put',
      data: fd
    }
  },
  /**
   * 删除文件
   * @param {Number} uid 用户ID
   * @param {String} path 路径
   * @param {String[]} names 文件名
   * @returns 删除数量
   */
  delete(uid: IdType, path: string, names: string[]): CommonRequest<number> {
    const u = StringUtils.appendPath(`/${this.prefix}/${uid}/content`, path)
    return {
      url: u.replace(/\/+/g, '/'),
      method: 'delete',
      data: {
        fileName: names
      },
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    }
  },
  /**
   * 文件重命名
   * @param {String} uid 用户ID
   * @param {String} path 所在路径
   * @param {String} oldName 原文件名
   * @param {String} newName 新文件名
   * @returns
   */
  rename(uid: IdType, path: string, oldName: string, newName: string): CommonRequest {
    if (path == '/') path = ''
    return {
      url: StringUtils.appendPath(`${this.prefix}/${uid}/name`, StringUtils.encodeURLPath(path)),
      method: 'put',
      data: {
        oldName: oldName,
        newName: newName
      }
    }
  },
  /**
   * 下载文件url
   * @param {Number} uid 用户ID
   * @param {String} filePath 文件在网盘中的完整路径
   */
  getContent(uid: IdType, filePath: string) {
    return {
      url: StringUtils.appendPath(`${this.prefix}/${uid}/content`,filePath)
    }
  },
  /**
   * 解压文件
   * @param {Number} uid 用户ID
   * @param {String} path 压缩文件所在目录
   * @param {String} name 压缩文件名
   * @param {String} dest 解压位置
   */
  unzip(uid: IdType, path: string, name: string, dest: string): CommonRequest {
    return {
      url: StringUtils.encodeURLPath(`${this.prefix}/${uid}/extractArchive/${path}`),
      method: 'post',
      data: {
        name: name,
        dest
      }
    }
  }
}

export default file
