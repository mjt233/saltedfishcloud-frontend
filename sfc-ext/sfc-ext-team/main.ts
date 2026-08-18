import { BoxMenuContext, ConditionFunction, getContext, MenuItem } from 'sfc-common'
import teamSpaceView from './components/team-space-view.vue'
import TeamManageView from './components/team-manage-view.vue'
import TeamApi from './api'

const SfcUtils = window.SfcUtils

/**
 * 注册团队空间插件：
 * - 主菜单：将【团队空间】入口放到【我的网盘】下方，点击进入 /team 页面
 * - 百宝箱：新增【团队管理】入口（创建/修改/解散团队、成员管理等）
 */
window.bootContext.addProcessor({
  taskName: '注册团队空间插件（主菜单团队空间 + 百宝箱团队管理）',
  execute(app) {
    if (!SfcUtils.getSystemFeature(TeamApi.featurePrefix, TeamApi.feature.isEnabled)) {
      return
    }
    // 注册全局组件，供百宝箱页通过组件名动态渲染
    app.component('team-space-view', teamSpaceView)
    app.component('team-manage-view', TeamManageView)

    // 1. 主菜单：将「团队空间」插入到「我的网盘」（id 为 private）下方
    const mainMenu = getContext().menu.value.mainMenu
    const mainGroup = mainMenu.group.find(g => g.id === 'main')
    if (mainGroup) {
      const menuItem = {
        id: 'team-space',
        title: '团队空间',
        route: '/team',
        icon: 'mdi-account-group',
        renderOn: ConditionFunction.hasLogin
      }
      // 锚定「我的网盘」菜单项，插入到其后方
      const insertIndex = mainGroup.items.findIndex(item => item.id === 'private')
      if (insertIndex >= 0) {
        mainGroup.items.splice(insertIndex + 1, 0, menuItem)
      } else {
        mainGroup.items.push(menuItem)
      }
    }

    // 2. 注册 /team 路由（作为 common 的子路由，保证通用顶部栏与侧边栏正常渲染）
    const router = getContext().routeInfo.value.router
    if (router) {
      router.addRoute('common', {
        path: '/team',
        component: teamSpaceView
      })
      // 若当前已位于 /team，重新导航一次使新增路由匹配生效
      const currentRoute = getContext().routeInfo.value.curr
      if (currentRoute && currentRoute.path === '/team') {
        router.replace('/').then(() => router.replace('/team'))
      }
    }

    // 3. 百宝箱：新增「团队管理」入口（放在「协作」分组）
    const boxMenu = getContext().menu.value.boxMenu
    const teamGroup = boxMenu.find(e => e.id === 'teamGroup')
    const menuItem: MenuItem<BoxMenuContext> = {
      id: 'team-manage',
      icon: 'mdi-account-cog',
      title: '团队管理',
      renderOn() {
        return ConditionFunction.hasLogin(getContext())
      },
      action(ctx) {
        ctx.title = '团队管理'
        ctx.currentComponent = 'team-manage-view'
      }
    }
    if (teamGroup) {
      teamGroup.items.push(menuItem)
    } else {
      boxMenu.push({
        id: 'teamGroup',
        name: '协作',
        items: [menuItem]
      })
    }
  }
})