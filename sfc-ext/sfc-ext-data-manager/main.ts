import { getContext, MenuHelper } from 'sfc-common'
import { h } from 'vue'
import InvalidDataManager from './components/InvalidDataManager.vue'
import ClaimDataList from './components/ClaimDataList.vue'
import InvalidDataClaim from './components/InvalidDataClaim.vue'
import { registerGroovyLanguage } from './groovy-language'

window.bootContext.addProcessor({
  taskName: '注册数据管理(sfc-ext-data-manager)插件组件',
  execute(app, handler) {
    // 注册为全局组件，这样后端的插件配置中如果 inputType='template'，可以直接使用组件名
    app.component(InvalidDataManager.name as string, InvalidDataManager)
    app.component(ClaimDataList.name as string, ClaimDataList)
    app.component(InvalidDataClaim.name as string, InvalidDataClaim)
    
    // 给普通用户添加"认领数据"的入口，添加到百宝箱中
    MenuHelper.addMoreBoxMenu({
      id: 'claim-data-list',
      title: '认领失效数据',
      icon: 'mdi-database-search',
      action(ctx) {
        ctx.title = '认领失效数据'
        ctx.currentComponent = h(ClaimDataList)
      }
    })

    // 注册 Groovy 语言支持
    const monaco = window.monaco
    registerGroovyLanguage(monaco)
  }
})