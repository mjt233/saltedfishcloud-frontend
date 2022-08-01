import { CommonRequest, IdType, NodeInfo } from '@/core/model'

const resource = {
  prefix: 'resource',
  /**
   * 获取文件资源的jpg缩略图
   * @param md5 文件资源的md5
   * @param type 源资源类型（拓展名）
   */
  getThumbnail(md5: string, type: string) {
    return {
      url: `${this.prefix}/114514/thumbnail/${md5}?type=${type}`
    }
  },
  /**
   * 获取路径途径的节点信息。
   * 数组末尾元素是最后一个节点，首元素是首节点。
   * （不会包含根节点）
   * @param uid 用户ID
   * @param path 路径
   */
  getNodeInfo(uid: number, path: string): CommonRequest<NodeInfo[]> {
    path = path.replace(/\/+/g, '/')
    if (path.startsWith('/')) {
      path = path.substring(1)
    }
    return {
      url: `${this.prefix}/${uid}/node/${path}`
    }
  },
  /**
   * 通过MD5下载文件
   * @param md5 文件MD5
   * @param alias 文件重命名
   */
  downloadFileByMD5(md5: string, alias: string) {
    return {
      url: `${this.prefix}/0/fileContentByMD5/${md5}/${encodeURIComponent(alias)}`
    }
  },
  /**
   * 获取使用文件下载码下载文件的链接
   * @param dc 下载码
   * @param directDownload 是否直接下载
   * @param name 文件名
   */
  downloadUseFileDC(dc: string, directDownload = false, name = '') {
    let baseURI = `${this.prefix}/0/fileContentByFDC/${dc}`
    if (name !== '') baseURI += `/${encodeURIComponent(name)}`
    if (directDownload) baseURI += '?download=true'
    return baseURI
  },
  /**
   *
   * @param uid 用户ID
   * @param path 文件所在目录
   * @param name 文件名
   * @param md5 文件MD5
   * @param expr 有效期（单位：天，负数为无限制）
   * @returns
   */
  getFileDC(uid: number, path: string, name: string, md5: string, expr: number) {
    return {
      url: `${this.prefix}/${uid}/FDC/${path}`,
      params: {
        name: name,
        md5: md5,
        expr: expr
      }
    }
  },
  /**
   * 解析节点ID取路径
   * @param uid 用户ID
   * @param nodeId 节点ID
   * @returns 路径
   */
  parseNodeId(uid: IdType, nodeId: string):CommonRequest<string> {
    return {
      url: `${this.prefix}/${uid}/path/${nodeId}`
    }
  }
}

export default resource
