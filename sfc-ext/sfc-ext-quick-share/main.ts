import { BoxMenuContext, context, MenuItem, SfcUtils } from 'sfc-common'
import quickShareView from './components/quick-share-view.vue'
import QuickShareApi from './api'

window.bootContext.addProcessor({
  taskName: '注册组件 - 文件快速传',
  execute(app) {
    if ( !SfcUtils.getSystemFeature(QuickShareApi.featurePrefix, QuickShareApi.feature.isEnabled) ) {
      return
    }
    app.component(quickShareView.name, quickShareView)
    const menu = context.menu.value.boxMenu.find(e => e.id == 'shareAndCollection')
    const menuItem: MenuItem<BoxMenuContext> = {
      id: 'quick-share',
      icon: 'mdi-flash',
      title: '文件极速传',
      action(ctx) {
        ctx.title = '文件极速传'
        ctx.currentComponent = 'quick-share-view'
      }
    }
    
    if (menu) {
      menu.items.push(menuItem)
    } else {
      context.menu.value.boxMenu.push({
        id: 'shareAndCollection',
        name: '文件交流',
        items: [menuItem]
      })
    }
  }
})