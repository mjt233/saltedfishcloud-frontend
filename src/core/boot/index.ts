import API from '@/api'
import SfcUtils from '@/utils/SfcUtils'
import { reactive } from 'vue'
import { EventNameConstants } from '../constans/EventName'
import { context } from '../context'
import { ConditionFunction } from '../helper/ConditionFunction'
import { ConfigNodeModel } from '../model'
import { buildExtensionManager } from '../serivce/Extension'
import { bootContext } from './BootCore'

let isValidSessionSuccess = false

bootContext
  .addProcessor({
    taskName: '获取服务器信息',
    async execute() {
      const data = (await SfcUtils.request(API.sys.getFeature())).data
      context.feature.value = reactive(data)
      if (data.bgMain) {
        context.bg.value.main = data.bgMain
      }
      // 默认开启黑暗模式
      if (data.darkTheme) {
        context.theme.value = 'dark'
      }
      // 监听系统配置变更，实时更新背景图
      context.eventBus.value.on(EventNameConstants.SYS_CONFIG_CHANGE, (changeList: ConfigNodeModel[]) => {
        const config = changeList.find(e => e.name == 'sys.bg.main')
        if (config) {
          const newOption = JSON.parse(config.value)
          context.bg.value.main = newOption
          context.feature.value.bgMain = newOption
        }
      })
    }
  })
  .addProcessor({
    taskName: '验证登录状态',
    async execute() {
      const session = context.session.value
      session.loadToken()
      try {
        if (ConditionFunction.hasLogin(context)) {
          const userInfo = ( await SfcUtils.request(API.user.getUserInfo())).data.data
          session.setUserInfo(userInfo)
          isValidSessionSuccess = true
        }
      } catch (err) {
        console.log('登录已过期')
        context.session.value.setToken('')
        return false
      }
    },
    onFinish() {
      if (isValidSessionSuccess) {
        SfcUtils.snackbar(`欢迎回来，${context.session.value.user.name}`, 1500, { showClose: false, outClose: true })
      }
    }
  })
  .addProcessor({
    taskName: '加载插件',
    async execute(app, handler) {
      return buildExtensionManager({app, bootContextHandler: handler}).mountAll()
    }
  })
  .addProcessor({
    taskName: '清理',
    onFinish(app, handler) {
      const bootDom = document.querySelector('#boot-info') as HTMLElement
      bootDom.classList.add('hide')
      setTimeout(() => {
        bootDom.remove()
      }, 250)
    }
  })



const bootApp = () => {
  bootContext.start()
}

export default bootApp