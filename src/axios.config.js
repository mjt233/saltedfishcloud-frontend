import axios from 'axios'
import qs from 'qs'
import mdui from 'mdui'
import Store from './Store'
axios.defaults.baseURL = '/api/'
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded'

// axios请求拦截器 添加token 和转换表单数据类型
axios.interceptors.request.use(conf => {
  if (conf.data !== undefined && conf.method === 'post') {
    let name = conf.data.constructor.name
    if (name !== 'FormData' && conf.headers['Content-Type'].indexOf('json') === -1) {
      conf.data = qs.stringify(conf.data)
    }
  }
  return conf
})
axios.interceptors.response.e
// axios响应拦截器 拦截所有错误请求 默认弹框
axios.interceptors.response.use(
  conf => {
    switch (conf.data.code) {
      case 1: return conf
      case -1:
          Store.commit('setUserInfo', null)
          if (!conf.config.noDefaultAction) {
            mdui.alert(conf.data.msg)
          }
          break
      case 0:
          mdui.alert(conf.data.msg)
    }
    return Promise.reject(conf.data)
  },
  err => {
    if (err.response) {
      if (err.config.noDefaultAction) {
          return Promise.reject(err)
      }
      mdui.snackbar('服务器错误', {
        'position': 'top'
      })
    } else {
      mdui.alert('网络错误')
    }
    return Promise.reject(err)
  }
)

export default axios