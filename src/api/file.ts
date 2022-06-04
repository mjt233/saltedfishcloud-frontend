import { CommonRequest, FileInfo, FileTransferInfo, PageRequest } from '@/core/model'
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
  quickSave(uid: number, path: string, name: string, md5: string): CommonRequest<Boolean> {
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
  createWrap(uid: number, fileTransferObj: FileTransferInfo): CommonRequest<string> {
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
  compress(uid: number, fileTransferObj: FileTransferInfo): CommonRequest {
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
  search(uid: string, key: string, page: number = 1): PageRequest<FileInfo> {
    return {
      url: `${this.prefix}/${uid}/fileList/byName/${key}`,
      method: 'get',
      params: {
        page: page
      }
    }
  },
  /**
   * 复制文件或目录
   * @param {Number} uid 用户ID
   * @param {String} source 原文件所在目录
   * @param {String} target 目标文件所在目录
   * @param {boolean} overwrite 是否覆盖原有文件
   * @param {FileTransferInfo} files 要操作的文件信息
   */
  copy(uid: number, source: string, target: string, overwrite: boolean = true, files: FileTransferInfo): CommonRequest {
    if (source == '/') source = ''
    return {
      method: 'post',
      url: `/${this.prefix}/${uid}/fromPath/${source}`,
      data: {
        target: target,
        files: files,
        overwrite: overwrite
      },
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    }
  },
  /**
   * 复制文件或目录
   * @param {Number} uid 用户ID
   * @param {String} source 原文件所在目录
   * @param {String} target 目标文件所在目录
   * @param {boolean} overwrite 是否覆盖原有文件
   * @param {FileTransferInfo} files 要操作的文件信息
   */
  move(uid: number, source: string, target: string, overwrite: boolean = true, files: FileTransferInfo): CommonRequest {
    const conf = this.copy(uid, source, target, overwrite, files)
    conf.method = 'put'
    return conf
  },
  /**
   * 取文件列表
   * @param {String} uid 用户ID
   * @param {String} path 路径
   * @returns 下标0 - 目录，下标1 - 文件
   */
  getFileList(uid: number, path: string): CommonRequest<FileInfo[][]> {
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
  mkdir(uid: number, path: string, name: string): CommonRequest {
    if (path == '/') path = ''
    let url = `/${this.prefix}/${uid}/dir/${path}`
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
  upload(uid: number, path: string, file: File, md5: string): CommonRequest<number> {
    path = path.split('/').map(e => encodeURIComponent(e)).join('/')
    if (path == '/') path = ''
    return {
      url: `${this.prefix}/${uid}/file/${path}`,
      method: 'put',
      data: {
        file: file,
        md5: md5
      }
    }
  },
  /**
   * 删除文件
   * @param {Number} uid 用户ID
   * @param {String} path 路径
   * @param {String[]} names 文件名
   * @returns 删除数量
   */
  delete(uid: number, path: string, names: string[]): CommonRequest<number> {
    const u = `/${this.prefix}/${uid}/content/${path}`
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
  rename(uid: number, path: string, oldName: string, newName: string): CommonRequest {
    if (path == '/') path = ''
    return {
      url: `${this.prefix}/${uid}/name/${path}`,
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
  getContent(uid: number, filePath: string) {
    return {
      url: `${this.prefix}/${uid}/content/${filePath}`
    }
  },
  /**
   * 解压文件
   * @param {Number} uid 用户ID
   * @param {String} path 压缩文件所在目录
   * @param {String} name 压缩文件名
   * @param {String} dest 解压位置
   */
  unzip(uid: number, path: string, name: string, dest: string): CommonRequest {
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
