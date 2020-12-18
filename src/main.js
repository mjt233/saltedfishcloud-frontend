// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import 'mdui/dist/css/mdui.css'
import mdui from 'mdui'
import qs from 'qs'
import 'default-passive-events'
axios.defaults.baseURL = "http://127.0.0.1:8080/api"
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded'

// axios请求拦截器 添加token 和转换表单数据类型
axios.interceptors.request.use(conf => {
  let token = localStorage.getItem('token')
  if (token) {
    conf.headers.token = token
  }
  if (conf.data !== undefined) {
    let name = conf.data.constructor.name
    if (name !== 'FormData') {
      conf.data = qs.stringify(conf.data)
    }
  }
  return conf
})
// axios响应拦截器 拦截所有错误请求 默认弹框
axios.interceptors.response.use(conf => {
  if (conf.status !== 200) {
    mdui.alert(`错误码：${conf.status}`)
    return
  }
  switch (conf.data.code) {
    case 1: return conf
    case -1:
        if (conf.config.url !== 'User/getUserInfo') {
          mdui.alert(conf.data.msg, '提示')
        }
        localStorage.clear()
    default:
      return Promise.reject(conf.data.msg)
  }
})
Vue.config.productionTip = false
Vue.use(VueAxios, axios)
Vue.prototype.$axios = axios
Vue.prototype.$mdui = mdui.$
Vue.prototype.$eventBus = new Vue()
/* eslint-disable no-new */
window.vue = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
