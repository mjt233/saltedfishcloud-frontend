import BaseDialog from '@/components/common/BaseDialog.vue'
import vuetify from '@/plugins/vuetify'

import { Component, createApp, h } from 'vue'

export function dialog(component: Component) {
  const tempDOM = document.createElement('div')
  document.body.appendChild(tempDOM)

  // 动态创建组件
  const tempApp = createApp({
    render() {
      // @ts-ignore
      return h(BaseDialog, {
        
      })
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