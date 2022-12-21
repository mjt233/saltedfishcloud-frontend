import { StringUtils } from '@/utils/StringUtils'
import { ApiRequest, CommonRequest, SystemFeature, PluginInfo } from '@/core/model'
const sys = {
  /**
   * 获取系统特性
   */
  getFeature(): ApiRequest<SystemFeature> {
    return {
      url: '/hello/feature'
    }
  },
  /**
   * 获取需要自动加载前端资源的插件列表
   */
  listPluginAutoLoadList(): CommonRequest<PluginInfo[]> {
    return {
      url: '/plugin/listPluginAutoLoadList'
    }
  },
  /**
   * 获取插件的资源内容
   * @param pluginName 插件名称
   * @param resourcePath 该插件的静态资源路径
   */
  getPluginResource(pluginName: string, resourcePath: string): CommonRequest {
    return {
      url: StringUtils.appendPath(`/plugin/${pluginName}/resource`, resourcePath)
    }
  },
  /**
   * 获取插件自动加载资源的单文件合并版本
   * @param type 资源类型
   */
  getMergeAutoLoadResource(type: 'js' | 'css'): CommonRequest {
    return {
      url: `/plugin/autoLoad.${type}`
    }
  }
}

export default sys