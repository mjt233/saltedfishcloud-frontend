import { ApiRequest, SystemFeature } from '@/core/model'
const sys = {
  /**
     * 获取系统特性
     */
  getFeature(): ApiRequest<SystemFeature> {
    return {
      url: '/hello/feature'
    }
  }
}

export default sys