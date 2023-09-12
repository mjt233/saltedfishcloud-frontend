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
