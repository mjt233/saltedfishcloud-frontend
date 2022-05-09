import { DefineComponent, createApp, h, App, Component } from 'vue'
import vuetify from '@/plugins/vuetify'

export interface DyncComponentHandler {
  /**
   * 卸载组件
   */
  unmount: Function,
  getInst: App<Element>
}

/**
 * 动态挂载一个组件
 * @param component 组件
 * @param props     附加的props或事件监听函数
 * @returns         动态组件操作器
 */
export function dyncmount(component: Component, props?: Object): DyncComponentHandler {
  const tempDOM = document.createElement('div')
  document.body.appendChild(tempDOM)

  // 动态创建组件
  const tempApp = createApp({
    render() {
      // @ts-ignore
      return h(component, props)
    }
  })

  // 挂载
  tempApp.use(vuetify).mount(tempDOM)

  return {
    unmount() {
      tempApp.unmount()
      document.body.removeChild(tempDOM)
    },
    // @ts-ignore
    getInst(): App<Element> {
      return tempApp
    }
  }
}