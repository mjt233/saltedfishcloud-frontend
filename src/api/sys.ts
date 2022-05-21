import { CommonRequest } from '@/core/model'
const sys = {
  /**
     * 获取系统特性
     */
  getFeature(): CommonRequest {
    return {
      url: '/hello/feature'
    }
  }
}

export default sys