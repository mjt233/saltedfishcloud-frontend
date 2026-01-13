import { ApiRequest, CommonRequest, IdType, PluginInfo, PluginInfoVo } from 'sfc-common/model'
import { StringUtils } from 'sfc-common/utils'

const plugin = {
  prefix: '/plugin',
  /**
   * 下载插件
   * @param name 插件名称
   */
  getPlugin(name: string): ApiRequest<any> {
    return {
      url: `${this.prefix}/getPlugin?name=${name}`,
    }
  },
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
  },
  /**
   * 获取插件内的静态资源
   * @param name 插件名称（唯一标识）
   * @param path 资源路径
   */
  getPluginResource(name: string, path: string): ApiRequest<any> {
    return {
      url: StringUtils.appendPath(`${this.prefix}/${name}/resource`, path)
    }
  },
}

export default plugin