import { IdType } from './../../model/Common'
import { useJsonBody } from 'sfc-common/utils/FormUtils/CommonFormUtils'
import { CommonRequest, SystemOverview, TimestampRecord } from 'sfc-common/model'
import { NameValueType, PluginConfigNodeInfo } from 'sfc-common/model'
import { SystemInfo } from 'sfc-common/model/SystemInfo'
// /**
//  * @typedef {Object} ProxyInfo
//  * @property {String} name
//  * @property {('HTTP'|'SOCKS')} type
//  * @property {Number} port
//  * @property {Strinig} address
//  */
const sys = {
  prefix: '/admin/sys',
  restart(): CommonRequest {
    return {
      url: `${this.prefix}/restart`
    }
  },
  /**
   * 获取系统当前信息
   * @param nodeId 指定集群节点id
   */
  getCurSystemInfo(nodeId?: IdType): CommonRequest<SystemInfo> {
    return {
      url: `${this.prefix}/getCurSystemInfo`,
      params: {
        nodeId
      }
    }
  },
  /**
   * 列出系统一段连续时间范围内的信息
   * @param nodeId 指定集群节点id
   */
  listSystemInfo(nodeId?: IdType): CommonRequest<TimestampRecord<SystemInfo>[]> {
    return {
      url: `${this.prefix}/listSystemInfo`,
      params: {
        nodeId
      }
    }
  },
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
  getOverviewInfo(): CommonRequest<SystemOverview> {
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
