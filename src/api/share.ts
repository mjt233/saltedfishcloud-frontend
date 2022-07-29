import { CommonPageInfo, CommonRequest } from '@/core/model'
import { useJsonBody } from '@/utils/FormUtils/CommonFormUtils'
import { FileInfo, FileTransferInfo } from './../core/model/FileInfo'

export interface CreateShareConfig {
  /** 文件所在路径 */
  path: string

  /** 文件名 */
  name: string

  /** 提取码 */
  extractCode?: string

  /** 到期日期Unix时间戳 */
  expiredAt?: number
  
}

export type ShareType = 'FILE' | 'DIR'

export interface ShareInfo {
  /** 分享id */
  id: number

  /** 所属用户id */
  uid: number

  /** 存储节点id */
  nid: string

  /** 父节点id */
  parentId?: string

  /** 分享校验码 */
  verification?: string

  /** 是否需要提取码 */
  needExtractCode: boolean

  /** 文件大小 */
  size: number

  /** 分享类型 */
  type: ShareType

  /** 提取码 */
  extractCode?: string

  /** 分享的文件名 */
  name: string

  /** 创建日期 */
  createdAt: string

  /** 过期日期 */
  expiredAt: string

  /** 分享者用户名 */
  username: string
}

const share = {
  prefix: '/share',

  /**
   * 在分享资源中创建多文件打包下载
   * @param sid 分享ID
   * @param verification 分享校验码
   * @param code 分享提取码
   * @param fileTransferObj 下载的文件参数
   * @returns 打包下载的下载码
   */
  createWrap(sid: string, verification: string, code: string, fileTransferObj: FileTransferInfo): CommonRequest<string> {
    return useJsonBody({
      method: 'post',
      url: `${this.prefix}/wrap/${sid}/${verification}`,
      params: {
        code: code
      },
      data: fileTransferObj
    })
  },
  /**
   * 删除一个分享
   * @param sid 分享ID
   */
  deleteShare(sid: string): CommonRequest {
    return {
      url: `${this.prefix}/${sid}`,
      method: 'delete'
    }
  },
  /**
   * 获取用户的分享列表
   * @param uid 用户ID，若为null则表示当前登录的用户，可查看提取码
   * @param page 页码，从1开始，默认1
   * @param size 每页大小，最小5，默认10
   */
  getShareList(uid: string | number | null, page = 1, size = 10): CommonRequest<CommonPageInfo<ShareInfo>> {
    return {
      url: `${this.prefix}/user${uid ? '/' + uid : ''}`,
      params: {
        page: page,
        size: size
      }
    }
  },
  /**
   * 创建分享
   * @param config 创建配置
   */
  createShare(config: CreateShareConfig): CommonRequest {
    return useJsonBody({
      url: `${this.prefix}`,
      method: 'post',
      data: config
    })
  },
  /**
   * 获取资源分享基本信息
   * @param sid 分享ID
   * @param verification 分享校验码
   * @param extractCode 资源提取码
   */
  getBaseShareInfo(sid: string, verification: string, extractCode: string): CommonRequest<CommonPageInfo<ShareInfo>> {
    const params: {code?: string} = {}
    if (extractCode) { params.code = extractCode }
    return {
      url: `${this.prefix}/${sid}/${verification}`,
      params: params
    }
  },
  /**
   * 浏览分享目录
   * @param sid 收集ID
   * @param verification 校验码
   * @param extractCode 提取码
   */
  browseDirShare(sid: string, verification: string, extractCode: string, path: string): CommonRequest<FileInfo> {
    path = path.split('/').map(e => encodeURIComponent(e)).join('/')
    let url = `${this.prefix}/view/${sid}/${verification}/${path}`
    url = url.replace(/\/\/+/, '/')
    return {
      url: url,
      params: {
        code: extractCode
      }
    }
  },
  /**
   * 从分享内容中下载单个文件
   * @param sid 分享ID
   * @param verification 分享校验码
   * @param code 提取码
   * @param path 资源所在路径
   * @param name 文件名
   * @returns
   */
  getFileContent(sid: string, verification: string, code: string, path: string, name: string) {
    if (path) {
      path = path.split('/').map(e => encodeURIComponent(e)).join('/')
    }
    if (name) name = encodeURIComponent(name)
    return {
      url: `${this.prefix}/resource`,
      params: {
        sid: sid,
        verification: verification,
        code: code,
        path: path,
        name: name
      }
    }
  }
}

export default share
