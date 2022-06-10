import API from '@/api'
import router from '@/plugins/router'
import vuetify from '@/plugins/vuetify'
import SfcUtils from '@/utils/SfcUtils'
import App from '@/App.vue'
import { createApp, reactive } from 'vue'
import { context } from '../context'
import { ConditionFunction } from '../helper/ConditionFunction'
import { extensionManager } from '../serivce/Extension'

export async function loadPlugin() {
  return await extensionManager.mountAll()
}

/**
 * 校验token是否有效以保持登录状态
 */
async function validSession() {

  const session = context.session.value
  session.loadToken()
  try {
    if (ConditionFunction.hasLogin(context)) {
      const userInfo = ( await SfcUtils.request(API.user.getUserInfo())).data.data
      session.setUserInfo(userInfo)
      SfcUtils.snackbar(`欢迎回来，${context.session.value.user.name}`, 1500, { showClose: false, outClose: true })
      return true
    } else {
      return false
    }
  } catch (err) {
    console.log('登录已过期')
    context.session.value.setToken('')
    return false
  }
}

/**
 * 获取后端系统开放的特性
 */
async function getFeature() {
  const data = (await SfcUtils.request(API.sys.getFeature())).data
  context.feature.value = reactive(data)
}


async function mountApp() {
  const app = createApp(App)
  app.use(router)
    .use(vuetify)
    .mount('#app')
  createApp(App)
}
export {
  validSession,
  getFeature,
  mountApp
}