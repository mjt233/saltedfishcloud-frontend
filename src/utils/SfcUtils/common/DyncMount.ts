import { createApp, h, App, Component, ComponentPublicInstance, VNode, reactive } from 'vue'
import vuetify from '@/plugins/vuetify'
import router from '@/plugins/router'
import { context } from '@/core/context'
import { VApp } from 'vuetify/components'

export interface DyncComponentHandler<T> {
  /**
   * 卸载组件
   */
  unmount(): void,

  /**
   * 获取Vue组件实例
   */
  getComponentInst(): ComponentPublicInstance & T

  getApp(): App<Element>

  getRoot(): ComponentPublicInstance
}
const ROOT_REF_NAME = 'rootRefByDyncmount'
export type ChildrenType = VNode | Array<any> | string | Function | {
  default: ChildrenType,
  [slotName: string]: ChildrenType
}
/**
 * 动态挂载一个组件
 * @param component 组件
 * @param props     附加的props或事件监听函数
 * @returns         动态组件操作器
 */
export function dyncmount<T = {}>(component: Component, props: Object = {}, children?: ChildrenType): DyncComponentHandler<T> {
  const tempDOM = document.createElement('div')
  document.body.appendChild(tempDOM)
  tempDOM.style.position = 'fixed'
  tempDOM.style.left = '0'
  tempDOM.style.top = '0'
  Object.assign(props, {
    ref: ROOT_REF_NAME
  })
  
  // 动态创建组件
  const tempApp = createApp({
    render() {
      // @ts-ignore
      return h(
        VApp, reactive({
          theme: context.theme.value
        }),
        () => [
          h(component as any, props, children as any)
        ]
      )
    }
  })

  // 挂载
  const inst = tempApp.use(router).use(vuetify).mount(tempDOM)

  return {
    unmount() {
      document.body.removeChild(tempDOM)
      tempApp.unmount()
    },
    getComponentInst() {
      return (inst.$refs[ROOT_REF_NAME] as ComponentPublicInstance & T)
    },
    getApp() {
      return tempApp
    },
    getRoot() {
      return inst
    }
  }
}