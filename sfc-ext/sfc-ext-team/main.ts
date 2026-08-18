import { BoxMenuContext, getContext, MenuItem } from 'sfc-common'
import teamSpaceView from './components/team-space-view.vue'
import TeamApi from './api'

const SfcUtils = window.SfcUtils

/**
 * 注册团队空间组件与菜单入口
 */
window.bootContext.addProcessor({
  taskName: '注册组件 - 团队空间',
  execute(app) {
    if (!SfcUtils.getSystemFeature(TeamApi.featurePrefix, TeamApi.feature.isEnabled)) {
      return
    }
    app.component('team-space-view', teamSpaceView)
    const menu = getContext().menu.value.boxMenu.find(e => e.id == 'teamGroup')
    const menuItem: MenuItem<BoxMenuContext> = {
      id: 'team-space',
      icon: 'mdi-account-group',
      title: '团队空间',
      action(ctx) {
        ctx.title = '团队空间'
        ctx.currentComponent = 'team-space-view'
      }
    }
    if (menu) {
      menu.items.push(menuItem)
    } else {
      getContext().menu.value.boxMenu.push({
        id: 'teamGroup',
        name: '协作',
        items: [menuItem]
      })
    }
  }
})
