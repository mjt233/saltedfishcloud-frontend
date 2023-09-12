import { CommonPageInfo, CommonPageRequestParam, CommonRequest, IdType, ProxyInfo } from 'sfc-common/model'
import { useJsonBody } from 'sfc-common/utils'

const sys = {
  prefix: '/admin/sys/proxy',
  /**
   * 删除一个代理
   * @param proxyId 代理id
   */
  deleteProxy(proxyId: IdType): CommonRequest {
    return {
      url: this.prefix,
      method: 'delete',
      params: { proxyId }
    }
  },
  /**
   * 按用户id获取代理列表
   * @param uid         用户id
   * @param pageParam   分页请求，为空则不分页
   */
  findByUid(uid: IdType, pageParam?: CommonPageRequestParam): CommonRequest<CommonPageInfo<ProxyInfo>> {
    return {
      url: `${this.prefix}/findByUid`,
      method: 'get',
      params: { uid, ...(pageParam || {}) }
    }
  },
  /**
   * 测试代理连通性
   * @param proxyId 代理id
   * @param timeout 超时时间（ms）
   * @param useCache 是否使用缓存结果（默认使用）
   */
  test(proxyId: IdType, timeout?: number, useCache?: boolean): CommonRequest<boolean> {
    return {
      url: `${this.prefix}/test`,
      params: {
        proxyId,
        timeout: timeout || 10000,
        useCache: useCache === undefined ? true : useCache
      }
    }
  },
  /**
   * 保存一个代理信息
   * @param {ProxyInfo} proxy 要保存的代理
   * @returns {import("axios").AxiosRequestConfig}
   */
  save(proxy: ProxyInfo): CommonRequest<ProxyInfo> {
    return useJsonBody({
      url: `${this.prefix}/save`,
      method: 'post',
      data: proxy
    })
  }
}

export default sys
