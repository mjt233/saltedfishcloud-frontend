import { createApp } from 'vue'
import API from './api'
import App from './App.vue'
import { context } from './core/context'
import { ConditionFunction } from './core/helper/ConditionFunction'
import axios from './plugins/axios'
import router from './plugins/router'
import vuetify from './plugins/vuetify'
import SfcUtils from './utils/SfcUtils'

context.routeInfo.value.router = router
async function validSession() {

  const session = context.session.value
  session.loadToken()
  
  if (ConditionFunction.hasLogin(context)) {
    const userInfo = (await axios(API.user.getUserInfo())).data.data
    session.setUserInfo(userInfo)
    
    return true
  } else {
    console.log('未登录')

    return false
  }
}

validSession()
  .then(e => {
    if (e) {
      SfcUtils.snackbar(`欢迎回来，${context.session.value.user.name}`, 1500, { showClose: false })
    }
  })
  .catch(() => {
    console.log('登录已过期')
  })
  .finally(() => {
    const app = createApp(App)
    app.use(router)
      .use(vuetify)
      .mount('#app')
    createApp(App)
  })
