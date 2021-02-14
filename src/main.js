// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from './axios.config'
import VueAxios from 'vue-axios'
import 'mdui/dist/css/mdui.css'
import mdui from 'mdui'
import 'default-passive-events'
import Store from './Store'
Vue.config.productionTip = false
Vue.use(VueAxios, axios)
Vue.prototype.$axios = axios
Vue.prototype.$mdui = mdui.$
Vue.prototype.$eventBus = new Vue()
/* eslint-disable no-new */
let vue = new Vue({
  store: Store,
  router,
  components: { App },
  template: '<App/>'
})

// 挂载App前 先检查登录状态和获取用户信息，以解决一些依赖用户信息的组件在页码首次被打开加载时获取用户信息异常的问题，同时也可根据用户信息的有无判断是否已登录
axios.get("user",{noDefaultAction:true}).then((e) => {
  console.log('已登录')
  Store.commit('setUserInfo', e.data.data)
  mdui.snackbar(`欢迎回来，${e.data.data.user}`, {position: 'bottom'})
  vue.$mount('#app')
}).catch(() => {
  console.log('未登录')
  vue.$mount('#app')
})
window.vue = vue
