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

const extensionManager: ExtensionManager = {
  async getExtensionResource() {
    return [
      {
        name: 'demo',
        resource: {
          js: ['/ext-demo/extension-demo.umd.js'],
          css: ['/ext-demo/style.css']
        },
        type: 'static'
      }
    ]
  },
  async mount(extension) {
    const tags: HTMLElement[] = []
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