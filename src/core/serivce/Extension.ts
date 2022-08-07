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
  return (await SfcUtils.axios(url)).data
}

const extensionManager: ExtensionManager = {
  async getExtensionResource() {
    // 获取前端中内置的拓展（实验性）
    // 后期将可从后端API中获取拓展内容
    const defautExtensions = await fetchContent(location.origin + '/static-extension.json')
    const extensionResources = [].concat(defautExtensions)
    return extensionResources
  },
  async mount(extension) {
    const tags: HTMLElement[] = []

    // todo: 实现识别加载失败和加载成功，进度提示

    // 加载CSS资源
    extension.resource.css?.forEach(css => {
      const tag = document.createElement('link')
      tags.push(tag)
      if (extension.type == 'extension') {
        tag.href = StringUtils.appendPath(`/api/extension/${extension.name}/static`, css)
      } else {
        tag.href = css
      }
      tag.rel = 'stylesheet'
    })

    // 加载JS资源
    extension.resource.js?.forEach(js => {
      const tag = document.createElement('script')
      tags.push(tag)
      if (extension.type == 'extension') {
        tag.src = StringUtils.appendPath(`/api/extension/${extension.name}/static`, js)
      } else {
        tag.src = js
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