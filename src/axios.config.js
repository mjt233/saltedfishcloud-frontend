import axios from 'axios'
import qs from 'qs'
import Store from './Store'
import apiConfig from './api'
axios.defaults.baseURL = `${apiConfig.server}/api`
axios.defaults.withCredentials = true
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded'

// axios请求拦截器 添加token 和转换表单数据类型
axios.interceptors.request.use(conf => {
    if (Store.state.token != null) {
        conf.headers.Token = Store.state.token
    }
    if (conf.data !== undefined && conf.method !== 'get') {
        const name = conf.data.constructor.name
        if (name !== 'FormData' && conf.headers['Content-Type'].indexOf('json') === -1) {
            conf.data = qs.stringify(conf.data)
        }
    }
    return conf
})
// axios响应拦截器 拦截所有错误请求 默认弹框
axios.interceptors.response.use(
    conf => conf,
    err => {
        if (!err.response) {
            err.msg = '网络错误'
            return Promise.reject(err)
        }
        const status = err.status || err.response.status
        const msg = err.response.data.msg

        // mdui.snackbar(`错误：${msg}`, {
        //     position: 'bottom'
        // })

        if (status === 401) {
            Store.commit('setToken', null)
            Store.commit('setUserInfo', null)
        }
        err.msg = msg || err.response.data.message || (parseInt(status / 100) == 5 ? '服务器错误' : '未知错误')
        err.code = err.response.data.code
        err.status = status
        err.toString = () => {
            return err.msg
        }
        return Promise.reject(err)
    }
)

export default axios
