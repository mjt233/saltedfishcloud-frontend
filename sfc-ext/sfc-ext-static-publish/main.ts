import { ConditionFunction, getContext } from 'sfc-common'
import { h } from 'vue'
import StaticPublishSiteListView from './components/StaticPublishSiteListView.vue'
import StaticPublishSiteStatusListView from './components/StaticPublishSiteStatusListView.vue'

window.bootContext.addProcessor({
  taskName: '注册static-publish组件',
  execute(app, handler) {
    app.component(StaticPublishSiteListView.name as string, StaticPublishSiteListView)
    app.component(StaticPublishSiteStatusListView.name as string, StaticPublishSiteStatusListView)
    const menu = getContext().menu.value.boxMenu.find(e => e.id == 'shareAndCollection')
    menu?.items.push({
      id: 'static-publish',
      title: '静态资源站点',
      renderOn(ctx) {
        return ConditionFunction.hasLogin(getContext())
      },
      action(ctx) {
        ctx.title = '静态资源站点'
        ctx.currentComponent = h(StaticPublishSiteListView, {
          uid: getContext().session.value.user.id
        })
      },
    })
  },
})