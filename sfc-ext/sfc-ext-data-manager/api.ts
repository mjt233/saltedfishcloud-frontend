import { CommonRequest, useJsonBody } from 'sfc-common'
import type { CommonPageInfo } from 'sfc-common/model'
import type { IdType } from 'sfc-common/model'
import type { ClaimParam, ClaimRecord, FileTypeProviderInfo, InvalidDataQuery, InvalidDataRecord } from './model'

const baseUrl = '/dataManager/invalidData'

export namespace DataManagerAPI {
  /**
   * 获取所有文件类型识别器
   */
  export function listProviders(): CommonRequest<FileTypeProviderInfo[]> {
    return {
      url: `${baseUrl}/providers`
    }
  }

  /**
   * 发起检测任务
   * @returns 异步任务ID
   * @returns 任务成功发起后，异步任务的id
   */
  export function detect(): CommonRequest<IdType> {
    return {
      url: `${baseUrl}/detect`,
      method: 'post'
    }
  }

  /**
   * 发起文件识别任务
   * @returns 异步任务ID
   */
  export function identify(): CommonRequest<IdType> {
    return {
      url: `${baseUrl}/identify`,
      method: 'post'
    }
  }

  /**
   * 查询失效数据列表
   */
  export function list(query: InvalidDataQuery): CommonRequest<CommonPageInfo<InvalidDataRecord>> {
    return {
      url: `${baseUrl}/list`,
      params: query
    }
  }

  /**
   * 按ID查询失效数据详情
   */
  export function detail(id: IdType): CommonRequest<InvalidDataRecord> {
    return {
      url: `${baseUrl}/detail/${id}`
    }
  }

  /**
   * 批量发布为可认领
   * @param ids 要发布的失效数据ID列表
   */
  export function publish(ids: IdType[]): CommonRequest<any> {
    return useJsonBody({
      url: `${baseUrl}/publish`,
      method: 'post',
      data: ids
    })
  }

  /**
   * 批量取消发布
   * @param ids 要取消发布的失效数据ID列表
   */
  export function unpublish(ids: IdType[]): CommonRequest<any> {
    return useJsonBody({
      url: `${baseUrl}/unpublish`,
      method: 'post',
      data: ids
    })
  }

  /**
   * 批量快速修复
   */
  export function quickFix(ids: IdType[]): CommonRequest<any> {
    return useJsonBody({
      url: `${baseUrl}/quickFix`,
      method: 'post',
      data: ids
    })
  }

  /**
   * 工具函数：自动修复所有
   */
  export function quickFixAll(): CommonRequest<any> {
    return {
      url: `${baseUrl}/quickFix/all`,
      method: 'post'
    }
  }

  /**
   * 批量丢弃
   */
  export function discard(ids: IdType[]): CommonRequest<any> {
    return useJsonBody({
      url: `${baseUrl}/discard`,
      method: 'post',
      data: ids
    })
  }

  /**
   * 丢弃所有
   */
  export function discardAll(): CommonRequest<any> {
    return {
      url: `${baseUrl}/discard/all`,
      method: 'post'
    }
  }

  /**
   * 标记处理完成
   */
  export function markCompleted(id: IdType): CommonRequest<void> {
    return {
      url: `${baseUrl}/markCompleted/${id}`,
      method: 'post'
    }
  }

  /**
   * 认领
   */
  export function claim(param: ClaimParam, uid: IdType): CommonRequest<void> {
    return useJsonBody({
      url: `${baseUrl}/claim`,
      method: 'post',
      data: param,
      params: { uid }
    })
  }

  /**
   * 查询认领记录
   */
  export function getClaims(invalidDataId: IdType): CommonRequest<ClaimRecord[]> {
    return {
      url: `${baseUrl}/claims/${invalidDataId}`
    }
  }

  /**
   * 查询我的认领记录
   */
  export function myClaims(uid: IdType, page: IdType = 0, size: IdType = 10): CommonRequest<CommonPageInfo<ClaimRecord>> {
    return {
      url: `${baseUrl}/myClaims`,
      params: { uid, page, size }
    }
  }

  /**
   * 获取失效数据下载链接
   * @param id 失效数据记录ID
   */
  export function download(id: IdType): CommonRequest {
    return {
      url: `${baseUrl}/download/${id}`
    }
  }
}
