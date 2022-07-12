import { ApiRequest } from '@/core/model'

export interface CollectionInfoField {
  /** 字段名 */
  name: string

  /** 字段类型 */
  type: 'TEXT' | 'OPTION'

  /** 默认值 */
  value: string

  /** 字段描述 */
  describe: string

  /** 要求字段值匹配的正则 */
  pattern: string

  /** 候选项字符串数组（仅当type为OPTION时有效） */
  options: string
}

export interface CollectionParam {
  /** 标题 */
  title : string

  /** 接收者署名 */
  nickname : string

  /** 收集过期日期 */
  expiredAt : number

  /** 收集到的文件保存目录节点ID */
  saveNode : string

  /** 收集任务描述 */
  describe?: string

  /** 文件名匹配表达式 */
  pattern?: string

  /** 最多接收的文件次数 */
  allowMax?: number

  /** 允许最大的文件大小，-1为无限制 */
  maxSize?: number

  /** 是否允许匿名用户上传 */
  allowAnonymous? : boolean

  /** 使用字段类型收集时允许的源文件后缀名表达式 */
  extPattern?: string

  /** 字段 */
  field? : CollectionInfoField[]

}

export type CollectionState = 'OPEN' | 'CLOSED'

export interface CollectionInfo extends CollectionParam {
  state: CollectionState

  id: number

  verification: string

  saveNode: string

  savePathSnapshot: string

  available: number

  createdAt: string
}

export interface FieldInfo {
  /** 字段名称 */
  name: string

  /** 字段值 */
  value: string
}

export interface CollectionSubmitInfo {
  /** 待提交的文件名 */
  filename: string

  /** 提交的字段数组信息 */
  field: FieldInfo[]
}

const collection = {
  prefix: '/collection',
  /**
   * 提交一个文件到收集任务中
   * @param cid 收集ID
   * @param vid 校验码
   * @param submitInfo 附加提交信息
   * @param file 文件
   * @returns {import("axios").AxiosRequestConfig}
   */
  submit(cid: number, vid: string, submitInfo: CollectionSubmitInfo, file: File) {
    console.log(submitInfo)
    const fd = new FormData()
    fd.append('submitInfo', new Blob([window.JSON.stringify(submitInfo)], { type: 'application/json' }))
    fd.append('file', file)
    return {
      url: `${this.prefix}/${cid}/${vid}`,
      method: 'post',
      data: fd
    }
  },
  /**
   * 创建一个收集任务
   * @param {CollectionParam} collectionInfo
   * @returns {import("axios").AxiosRequestConfig}
   */
  create(collectionInfo: CollectionParam) {
    return {
      method: 'post',
      url: this.prefix,
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      data: collectionInfo
    }
  },
  /**
   * 获取当前用户创建的收集任务
   * @returns {import("axios").AxiosRequestConfig}
   */
  getCreated(): ApiRequest<CollectionInfo[]> {
    return {
      url: this.prefix
    }
  },
  /**
   * 获取收集信息
   * @param cid 收集ID
   * @param verification 校验码
   */
  getCollectionInfo(cid: number, verification: string) {
    return {
      url: `${this.prefix}/${cid}/${verification}`
    }
  },
  /**
   * 获取收集接收到的文件记录
   * @param cid 收集ID
   * @param page 页数
   * @param size 每页大小
   * @returns {import("axios").AxiosRequestConfig}
   */
  getRecords(cid: number, page: number, size: number) {
    return {
      url: `${this.prefix}/record/${cid}`,
      params: {
        page: page,
        size: size
      }
    }
  },
  /**
   * 关闭收集任务，停止接收文件
   * @param cid 收集ID
   */
  close(cid: number) {
    return {
      method: 'put',
      url: `${this.prefix}/${cid}/state/CLOSED`
    }
  },
  /**
   * 重新开启收集任务（若未过期）
   * @param cid 收集ID
   */
  open(cid: number) {
    return {
      method: 'put',
      url: `${this.prefix}/${cid}/state/OPEN`
    }
  },
  delete(cid: number) {
    return {
      method: 'delete',
      url: `${this.prefix}/${cid}`
    }
  }
}
export default collection
