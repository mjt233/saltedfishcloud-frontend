import { ConditionFunction, context } from 'sfc-common'
import { h } from 'vue'
import StaticPublishSiteListView from './components/StaticPublishSiteListView.vue'

window.bootContext.addProcessor({
  taskName: '注册static-publish组件',
  execute(app, handler) {
    app.component(StaticPublishSiteListView.name, StaticPublishSiteListView)
    const menu = context.menu.value.boxMenu.find(e => e.id == 'shareAndCollection')
    menu?.items.push({
      id: 'static-publish',
      title: '静态资源站点',
      renderOn(ctx) {
        return ConditionFunction.hasLogin(context)
      },
      action(ctx) {
        ctx.title = '静态资源站点'
        ctx.currentComponent = h(StaticPublishSiteListView, {
          uid: context.session.value.user.id
        })
      },
    })
  },
})