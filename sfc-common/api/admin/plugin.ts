import { CommonRequest, IdType, PluginInfo, PluginInfoVo } from 'sfc-common/model'

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
  /**
   * 上传一个插件
   * @param file 插件jar包
   */
  uploadPlugin(file: File): CommonRequest<PluginInfoVo> {
    const fd = new FormData()
    fd.set('file', file)
    return {
      url: `${this.prefix}/uploadPlugin`,
      method: 'post',
      data: fd
    }
  },
  /**
   * 确认安装一个插件
   * @param tempId 插件上传后的临时id
   * @param fileName 文件原始文件名
   */
  installPlugin(tempId: IdType, fileName: string): CommonRequest<PluginInfoVo> {
    const fd = new FormData()
    return {
      url: `${this.prefix}/installPlugin`,
      method: 'post',
      params: { tempId, fileName }
    }
  }
}

export default plugin