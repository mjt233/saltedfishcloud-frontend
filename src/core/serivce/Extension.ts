import API from '@/api'
import SfcUtils from '@/utils/SfcUtils'
import { StringUtils } from '@/utils/StringUtils'
export interface ExtensionResource {
  css?: string[],
  js?: string[]
}

export interface ExtensionInfo {
  name: string,
  resource: ExtensionResource,
  type: 'extension'|'static'
}

export interface ExtensionLoader {
  mount(extension: ExtensionInfo): Promise<any>
}

export interface ExtensionManager extends ExtensionLoader {
  getExtensionResource(): Promise<ExtensionInfo[]>
  mountAll(): Promise<any>
}

/**
 * 抓取URL响应内容
 * @param url url
 */
const fetchContent = async(url: string) => {
  return (await SfcUtils.axios(url)).data as ExtensionInfo[]
}

/**
 * 抓取需要自动加载资源的插件的资源列表
 */
const fetchPluginAutoLoadResource = async(): Promise<ExtensionInfo[]> => {
  return (await SfcUtils.request(API.sys.listPluginAutoLoadList())).data.data.map(plugin => {
    return {
      name: plugin.name,
      type: 'extension',
      resource: {
        js: plugin.autoLoad.filter(e => e.endsWith('.js')),
        css: plugin.autoLoad.filter(e => e.endsWith('.css'))
      }
    }
  })
}

const extensionManager: ExtensionManager = {
  async getExtensionResource() {
    // 获取前端中内置的拓展
    const defautExtensions = (await fetchContent(location.origin + '/static-extension.json')) 
    const pluginResource = await fetchPluginAutoLoadResource()
    const extensionResources = [...defautExtensions].concat(pluginResource)
    return extensionResources
  },
  async mount(extension) {
    const tags: HTMLElement[] = []

    // todo: 实现识别加载失败和加载成功，进度提示

    // 加载CSS资源
    extension.resource.css?.forEach(cssPath => {
      const tag = document.createElement('link')
      tags.push(tag)
      if (extension.type == 'extension') {
        tag.href = SfcUtils.getApiUrl(API.sys.getPluginResource(extension.name, cssPath))
      } else {
        tag.href = cssPath
      }
      tag.rel = 'stylesheet'
    })

    // 加载JS资源
    extension.resource.js?.forEach(jspath => {
      const tag = document.createElement('script')
      tags.push(tag)
      if (extension.type == 'extension') {
        tag.src = SfcUtils.getApiUrl(API.sys.getPluginResource(extension.name, jspath))
      } else {
        tag.src = jspath
      }
    })

    tags.forEach(tag => {
      document.documentElement.appendChild(tag)
    })
  },
  async mountAll() {
    const extensions = await this.getExtensionResource()
    const task: (Promise<any>)[] = []
    extensions.forEach(ext => {
      task.push(this.mount(ext))
    })
    return await Promise.all(task)
  }
}


export {
  extensionManager
}