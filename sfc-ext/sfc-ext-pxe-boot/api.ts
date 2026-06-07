import { CommonRequest, IdType, useJsonBody } from 'sfc-common'
import { BootItem, BootItemForm, PxeServiceStatus, PxeSessionInfo } from './model'

/**
 * PXE 启动插件 API
 */
export namespace PxeBootApi {
  const prefix = '/pxeBoot'

  /**
   * 获取服务状态
   */
  export function getStatus(): CommonRequest<PxeServiceStatus> {
    return {
      url: `${prefix}/status`
    }
  }

  /**
   * 获取所有启动项
   */
  export function listItems(): CommonRequest<BootItem[]> {
    return {
      url: `${prefix}/items`
    }
  }

  /**
   * 创建启动项
   */
  export function createItem(form: BootItemForm): CommonRequest<BootItem> {
    return useJsonBody({
      url: `${prefix}/items`,
      method: 'post',
      data: form
    })
  }

  /**
   * 更新启动项
   */
  export function updateItem(id: IdType, form: BootItemForm): CommonRequest<BootItem> {
    return useJsonBody({
      url: `${prefix}/items/${id}`,
      method: 'put',
      data: form
    })
  }

  /**
   * 删除启动项
   */
  export function deleteItem(id: IdType): CommonRequest {
    return {
      url: `${prefix}/items/${id}`,
      method: 'delete'
    }
  }

  /**
   * 启用启动项
   */
  export function enableItem(id: IdType): CommonRequest {
    return {
      url: `${prefix}/items/${id}/enable`,
      method: 'post'
    }
  }

  /**
   * 禁用启动项
   */
  export function disableItem(id: IdType): CommonRequest {
    return {
      url: `${prefix}/items/${id}/disable`,
      method: 'post'
    }
  }

  /**
   * 更新排序
   */
  export function reorderItems(orderedIds: IdType[]): CommonRequest {
    return useJsonBody({
      url: `${prefix}/items/reorder`,
      method: 'post',
      data: orderedIds
    })
  }

  /**
   * 预览 iPXE 菜单脚本
   */
  export function previewMenuScript(): CommonRequest<string> {
    return {
      url: `${prefix}/menu/preview`
    }
  }
}
