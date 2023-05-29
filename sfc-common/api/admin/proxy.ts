import { CommonRequest, IdType, ProxyInfo } from 'sfc-common/model'

const sys = {
  prefix: '/admin/sys/proxy',
  /**
   * 删除一个代理
   * @param name 代理名称
   */
  deleteProxy(name: IdType): CommonRequest {
    return {
      url: this.prefix,
      method: 'delete',
      params: {
        proxyName: name
      }
    }
  },
  /**
   * 添加一个代理节点
   * @param proxy 代理信息
   */
  addProxy(proxy: ProxyInfo): CommonRequest {
    return {
      url: this.prefix,
      method: 'post',
      data: proxy
    }
  },
  /**
   * 获取所有代理信息
   */
  getAllProxy(): CommonRequest<ProxyInfo[]> {
    return {
      url: this.prefix,
      method: 'get'
    }
  },
  /**
   * 更新一个代理信息
   * @param {String} name 原代理名称
   * @param {ProxyInfo} proxy 代理信息
   * @returns {import("axios").AxiosRequestConfig}
   */
  updateProxy(name: IdType, proxy: ProxyInfo) {
    return {
      url: this.prefix,
      method: 'put',
      params: {
        proxyName: name,
        type: proxy.type,
        port: proxy.port,
        address: proxy.address,
        name: proxy.name
      }
    }
  }
}

export default sys
