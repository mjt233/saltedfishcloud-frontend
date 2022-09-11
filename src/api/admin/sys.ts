import { useJsonBody } from '@/utils/FormUtils/CommonFormUtils'
import { CommonRequest } from '@/core/model'
import { NameValueType, PluginConfigNodeInfo } from './../../core/model/Common'
// /**
//  * @typedef {Object} ProxyInfo
//  * @property {String} name
//  * @property {('HTTP'|'SOCKS')} type
//  * @property {Number} port
//  * @property {Strinig} address
//  */
const sys = {
  prefix: '/admin/sys',
  /**
   * 读取所有配置项信息
   */
  getAllConfig() {
    return {
      url: `${this.prefix}/config`
    }
  },
  /**
   * 获取系统总览信息
   */
  getOverviewInfo() {
    return {
      url: `${this.prefix}/overview`
    }
  },
  /**
 * 设置配置项
 * @param key      配置项名
 * @param value    值
 */
  setConfig(key: string, value: string) {
    return {
      url: `${this.prefix}/config/${key}/${value}`,
      method: 'put'
    }
  },
  /**
   * 读配置项名
   * @param  key      配置项名
   * @returns
   */
  getConfig(key: string) {
    return {
      url: `${this.prefix}/config/${key}`
    }
  },
  /**
   * 列出所有插件的配置项
   */
  listPluginConfig(): CommonRequest<PluginConfigNodeInfo[]> {
    return {
      url: `${this.prefix}/config/listPluginConfig`
    }
  },
  batchSetConfig(config: NameValueType[]): CommonRequest {
    return useJsonBody({
      url: `${this.prefix}/config/batchSetConfig`,
      data: config,
      method: 'put'
    })
  }
}

export default sys
