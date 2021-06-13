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
import apiConfig from './api/API'
import formatter from './utils/StringFormatter'
import Theme from './utils/Theme'
import VueClipboard from 'vue-clipboard2'
Vue.config.productionTip = false
Vue.use(VueAxios, axios)
Vue.prototype.$axios = axios
Vue.prototype.$mdui = mdui.$
Vue.prototype.$eventBus = new Vue()
Vue.use(VueClipboard)
// 注册全局过滤器 格式化数字为方便阅读的存储大小表示
Vue.filter('formatSize', e => {
    return formatter.formatSizeString(e)
})
/* eslint-disable no-new */
const vue = new Vue({
    store: Store,
    router,
    components: { App },
    template: '<App/>'
})

// 挂载App前 先检查登录状态和获取用户信息，以解决一些依赖用户信息的组件在页码首次被打开加载时获取用户信息异常的问题，同时也可根据用户信息的有无判断是否已登录
const conf = apiConfig.user.getUserInfo()
conf.noDefaultAction = true

let token
// 加载之前登陆时保存的token
if (localStorage.getItem('token')) {
    token = localStorage.getItem('token')
    Store.commit('setToken', token)
}



axios(conf, { noDefaultAction: true }).then((e) => {
    mdui.snackbar(`欢迎回来，${e.data.data.user}`, { position: 'bottom' })
    Store.commit('setAvatarURL', `${apiConfig.getServer()}/api/${apiConfig.user.getAvatar(e.data.data.user).url}`)
    vue.$mount('#app')
}).catch(() => {
    Store.commit('setToken', null)
    localStorage.clear()
    console.log('未登录')
    vue.$mount('#app')
})
Theme.loadTheme()
window.vue = vue
