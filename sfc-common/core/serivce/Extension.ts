import { BootContextHandler } from 'sfc-common'
import API from 'sfc-common/api'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { App } from 'vue'
export interface ExtensionResource {
  css?: string[],
  js?: string[]
}

export interface ExtensionInfo {
  name: string,
  resource: ExtensionResource,
  type: 'extension'|'static'
}

export interface ExtensionContext {
  app: App<Element>

  bootContextHandler: BootContextHandler
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
  return [
    {
      name: 'autoLoad.js',
      type: 'static',
      resource: {
        js: [SfcUtils.getApiUrl(API.sys.getMergeAutoLoadResource('js'))],
        css: [SfcUtils.getApiUrl(API.sys.getMergeAutoLoadResource('css'))]
      }
    }
  ]
  // return (await SfcUtils.request(API.sys.listPluginAutoLoadList())).data.data.map(plugin => {
  //   return {
  //     name: plugin.name,
  //     type: 'extension',
  //     resource: {
  //       js: plugin.autoLoad.filter(e => e.endsWith('.js')),
  //       css: plugin.autoLoad.filter(e => e.endsWith('.css'))
  //     }
  //   }
  // })
}

function waitDOMLoaded(dom: HTMLElement) {
  return new Promise((resolve, reject) => {
    dom.addEventListener('load', resolve)
    dom.addEventListener('error', reject)
  })
}

function buildExtensionManager(context: ExtensionContext): ExtensionManager {
  return {
    async getExtensionResource() {
      // 获取前端中内置的拓展
      const defautExtensions = (await fetchContent(location.origin + '/static-extension.json')) 
      const pluginResource = await fetchPluginAutoLoadResource()
      const extensionResources = [...defautExtensions].concat(pluginResource)
      return extensionResources
    },
    async mount(extension) {
      const tags: HTMLElement[] = []
      context.bootContextHandler.logInfo('[加载拓展]' + extension.name)
      const waitPromises: Promise<any>[] = []
  
      // todo: 实现识别加载失败和加载成功，进度提示
  
      // 加载CSS资源
      extension.resource.css?.map(cssPath => {
        const tag = document.createElement('link')
        tags.push(tag)
        if (extension.type == 'extension') {
          tag.href = SfcUtils.getApiUrl(API.sys.getPluginResource(extension.name, cssPath))
        } else {
          tag.href = cssPath
        }
        tag.rel = 'stylesheet'
        context.bootContextHandler.logInfo(`[加载资源-${extension.name}]: ${cssPath}`)

        return waitDOMLoaded(tag).then(() => {
          context.bootContextHandler.logInfo(`[加载成功-${extension.name}]: ${cssPath}`)
        }).catch(err => {
          context.bootContextHandler.logWarning(`[加载失败-${extension.name}]: ${cssPath}`)
          context.bootContextHandler.logError(err)
          return Promise.reject(err)
        })
      }).forEach(p => waitPromises.push(p))
  
      // 加载JS资源
      extension.resource.js?.map(jspath => {
        const tag = document.createElement('script')
        tags.push(tag)
        if (extension.type == 'extension') {
          tag.src = SfcUtils.getApiUrl(API.sys.getPluginResource(extension.name, jspath))
        } else {
          tag.src = jspath
        }
        context.bootContextHandler.logInfo(`[加载成功-${extension.name}]: ${jspath}`)
        return waitDOMLoaded(tag).then(() => {
          context.bootContextHandler.logInfo(`[加载成功-${extension.name}]: ${jspath}`)
        }).catch(err => {
          context.bootContextHandler.logWarning(`[加载失败-${extension.name}]: ${jspath}`)
          context.bootContextHandler.logError(err)
          return Promise.reject(err)
        })
      }).forEach(p => waitPromises.push(p))
  
      tags.forEach(tag => {
        document.documentElement.appendChild(tag)
        
      })

      return Promise.all(waitPromises)
    },
    async mountAll() {
      try {
        const extensions = await this.getExtensionResource()
        const task: (Promise<any>)[] = []
        extensions.forEach(ext => {
          task.push(this.mount(ext))
        })
        return await Promise.all(task)
      } catch(err) {
        if (err) {
          context.bootContextHandler.logError((err as any).toString())
          return Promise.reject(err)
        }
      }
    }
  }
}



export {
  buildExtensionManager
}