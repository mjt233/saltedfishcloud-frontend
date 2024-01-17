import { CommonPageInfo, CommonRequest, JpaPageInfo } from 'sfc-common'
import { ApiRequest, PageInfo } from 'sfc-common/model'
import { CollectionInfo, CollectionParam, CollectionRecord, CollectionSubmitInfo } from 'sfc-common/model/FileCollection'

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
  submit(cid: number | string, vid: string, submitInfo: CollectionSubmitInfo, file: File): CommonRequest {
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
      // 确保extPattern为空时，不是空字符串
      data: {
        ...collectionInfo,
        extPattern: collectionInfo.extPattern || null
      }
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
  getCollectionInfo(cid: number|string, verification: string): ApiRequest<CollectionInfo> {
    return {
      url: `${this.prefix}/${cid}/${verification}`
    }
  },
  /**
   * 获取收集接收到的文件记录
   * @param cid 收集ID
   * @param page 页数
   * @param size 每页大小
   */
  getRecords(cid: number, page: number, size: number): CommonRequest<CommonPageInfo<CollectionRecord>> {
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
