import { createApp, h, App, Component, ComponentPublicInstance, VNode, reactive } from 'vue'
import vuetify from '@/plugins/vuetify'
import router from '@/plugins/router'
import { context } from '@/core/context'
import { VApp } from 'vuetify/components'
import { buildApp } from '@/core/boot/AppFactory'

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

export interface MountOption {
  wrapVApp?: boolean,
  vappProps?: any,
  tempDOMHandler?: (dom: HTMLElement) => void
  children?: ChildrenType | undefined | null | {[slotName: string]: ChildrenType | undefined}
  props?: any
}
/**
 * 动态挂载一个组件
 * @param component 组件
 * @param props     附加的props或事件监听函数
 * @returns         动态组件操作器
 */
export function dyncmount<T = {}>(component: Component,  mountOption?: MountOption): DyncComponentHandler<T> {
  const { wrapVApp = true, vappProps = {}, tempDOMHandler = ()=> {}, children, props = {} } = mountOption || {}
  const tempDOM = document.createElement('div')
  document.body.appendChild(tempDOM)
  tempDOM.style.position = 'fixed'
  tempDOM.style.left = '0'
  tempDOM.style.top = '0'
  tempDOM.style.width = '100vw'
  tempDOM.style.height = '100vh'
  tempDOMHandler(tempDOM)
  Object.assign(props, {
    ref: ROOT_REF_NAME
  })
  
  // 动态创建组件
  const tempApp = buildApp({
    render() {
      // @ts-ignore
      if (wrapVApp) {
        return h(
          VApp, reactive({
            theme: context.theme.value,
            ...vappProps
          }),
          () => [
            h(component as any, props, children as any)
          ]
        )
      } else {
        return h(component as any, props, children as any)
      }
    }
  })

  // 挂载
  const inst = tempApp.mount(tempDOM)

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