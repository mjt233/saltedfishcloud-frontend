import { CommonRequest } from 'sfc-common/model'
import { ProxyInfo } from 'sfc-common/model/Proxy'

/**
 * 任务相关接口集合。
 */
const task = {
  download: {
    prefix: '/task/download',
    /**
     * 获取可用的代理列表
     */
    getProxy(): CommonRequest<ProxyInfo[]> {
      return {
        url: `${this.prefix}/proxy`
      }
    }
  }
}
export default task
