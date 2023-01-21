import { CommonRequest, PluginInfo } from '@/core/model'

const plugin = {
  prefix: '/plugin',
  /**
   * 获取系统中所有能识别出的可用的插件
   */
  listAvailablePlugins(): CommonRequest<PluginInfo[]> {
    return {
      url: `${this.prefix}/listAvailablePlugins`
    }
  },
  /**
   * 删除一个插件
   * @param name 插件名称
   */
  deletePlugin(name: string): CommonRequest<PluginInfo[]> {
    return {
      url: `${this.prefix}/deletePlugin`,
      params: { name },
      method: 'post'
    }
  },

}

export default plugin