import { CommonRequest, useJsonBody } from 'sfc-common'
import type { CommonPageInfo } from 'sfc-common/model'
import type { IdType } from 'sfc-common/model'
import type { ClaimParam, ClaimRecord, FileTypeProviderInfo, InvalidDataFilterResult, InvalidDataQuery, InvalidDataRecord } from './model'

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
