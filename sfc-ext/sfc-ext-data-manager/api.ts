import { CommonRequest, useJsonBody } from 'sfc-common'
import type { CommonPageInfo } from 'sfc-common/model'
import type { IdType } from 'sfc-common/model'
import type { BatchClaimParam, BatchResult, ClaimParam, ClaimPreviewItem, ClaimRecord, FileTypeProviderInfo, InvalidDataFilterResult, InvalidDataQuery, InvalidDataRecord } from './model'

const baseUrl = '/dataManager/invalidData'

/**
 * 文件识别任务发起参数
 */
export interface IdentifyParam {
  /** 指定需要识别的失效数据ID列表，不指定则处理所有待处理待识别的记录 */
  ids?: IdType[]
  /** 是否重新识别，为true时即使记录无需识别也执行重新识别并覆盖原有结果 */
  reIdentify?: boolean
}

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
   * @param param 识别参数（可选），包含ids和reIdentify
   * @returns 异步任务ID
   */
  export function identify(param?: IdentifyParam): CommonRequest<IdType> {
    return useJsonBody({
      url: `${baseUrl}/identify`,
      method: 'post',
      data: param
    })
  }

  /**
   * 查询失效数据列表
   * @param query 查询参数
   * @param filterId 脚本筛选缓存 ID，传此值时使用缓存中的筛选结果分页
   */
  export function list(query: InvalidDataQuery, filterId?: string): CommonRequest<CommonPageInfo<InvalidDataRecord>> {
    return {
      url: `${baseUrl}/list`,
      params: filterId ? { ...query, filterId } : query
    }
  }

  /**
   * 提交 Groovy 脚本筛选，执行全量查询 + 脚本筛选，缓存结果并返回 filterId。
   * 后续可通过 `list(query, filterId)` 进行分页查询。
   * @param query 查询参数（含 filterScript）
   */
  export function filter(query: InvalidDataQuery): CommonRequest<InvalidDataFilterResult> {
    return useJsonBody({
      url: `${baseUrl}/filter`,
      method: 'post',
      data: query
    })
  }

  /**
   * 查询已发布可认领的失效数据列表
   */
  export function publishedList(query: InvalidDataQuery): CommonRequest<CommonPageInfo<InvalidDataRecord>> {
    return {
      url: `${baseUrl}/publishedList`,
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
   * 按条件批量丢弃
   * 根据筛选条件匹配并丢弃失效数据
   * @param query 筛选条件
   */
  export function discardByQuery(query: InvalidDataQuery): CommonRequest<BatchResult> {
    return useJsonBody({
      url: `${baseUrl}/discard/byQuery`,
      method: 'post',
      data: query
    })
  }

  /**
   * 按条件批量发布为可认领
   * 根据筛选条件匹配并发布失效数据
   * @param query 筛选条件
   */
  export function publishByQuery(query: InvalidDataQuery): CommonRequest<BatchResult> {
    return useJsonBody({
      url: `${baseUrl}/publish/byQuery`,
      method: 'post',
      data: query
    })
  }

  /**
   * 按条件批量取消发布
   * 根据筛选条件匹配并取消发布失效数据
   * @param query 筛选条件
   */
  export function unpublishByQuery(query: InvalidDataQuery): CommonRequest<BatchResult> {
    return useJsonBody({
      url: `${baseUrl}/unpublish/byQuery`,
      method: 'post',
      data: query
    })
  }

  /**
   * 按条件批量撤回认领
   * 根据筛选条件匹配并撤回已认领的失效数据
   * @param query 筛选条件
   */
  export function batchRevokeClaimByQuery(query: InvalidDataQuery): CommonRequest<BatchResult> {
    return useJsonBody({
      url: `${baseUrl}/batchRevokeClaim/byQuery`,
      method: 'post',
      data: query
    })
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

  /**
   * 批量认领预览
   * 查询匹配条件的可认领失效数据，解析每条记录认领后的保存路径与文件名
   * @param param 批量认领参数（含筛选条件、保存路径、脚本等）
   */
  export function previewBatchClaim(param: BatchClaimParam): CommonRequest<ClaimPreviewItem[]> {
    return useJsonBody({
      url: `${baseUrl}/batchClaim/preview`,
      method: 'post',
      data: param
    })
  }

  /**
   * 批量认领失效数据
   * 查询匹配条件的可认领失效数据，逐条解析保存路径与文件名后执行认领
   * @param param 批量认领参数（含筛选条件、保存路径、脚本等）
   */
  export function executeBatchClaim(param: BatchClaimParam): CommonRequest<BatchResult> {
    return useJsonBody({
      url: `${baseUrl}/batchClaim`,
      method: 'post',
      data: param
    })
  }

  /**
   * 将所有已认领的失效数据标记为已完成
   */
  export function markClaimedCompleted(): CommonRequest<any> {
    return {
      url: `${baseUrl}/markClaimedCompleted`,
      method: 'post'
    }
  }

  /**
   * 清理所有已完成处理的失效数据记录
   */
  export function cleanCompleted(): CommonRequest<any> {
    return {
      url: `${baseUrl}/cleanCompleted`,
      method: 'post'
    }
  }
}
