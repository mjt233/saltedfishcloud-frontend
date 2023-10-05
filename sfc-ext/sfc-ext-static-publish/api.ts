import { CommonRequest, IdType, context, useJsonBody } from 'sfc-common'
import { StaticPublishProperty, StaticPublishRecord } from './model'
const StaticPublishApi = {
  prefix: '/staticPublish',
  save(entity: StaticPublishRecord): CommonRequest {
    return useJsonBody({
      url: `${this.prefix}/save`,
      data: entity,
      method: 'post'
    })
  },
  listSite(uid: IdType): CommonRequest<StaticPublishRecord[]> {
    return {
      url: `${this.prefix}/listSite`,
      params: { uid },
      method: 'get'
    }
  },
  deleteSite(id: IdType): CommonRequest {
    return {
      url: `${this.prefix}/deleteSite`,
      params: { id },
      method: 'post'
    }
  },
  /**
   * 获取静态资源发布插件的配置参数
   */
  getProperty() {
    return context.feature.value['staticPublish'] as StaticPublishProperty
  }
}

export default StaticPublishApi
export {
  StaticPublishApi
}