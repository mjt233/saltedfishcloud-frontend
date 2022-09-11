import { context } from '@/core/context'
import { getPublicUser } from '@/core/context/session'
import axios from 'axios'
import qs from 'qs'

const inst = axios.create()
inst.defaults.baseURL = '/api'
inst.defaults.withCredentials = true
inst.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded'

// axios请求拦截器 添加token 和转换表单数据类型
inst.interceptors.request.use(conf => {
  if (!conf.headers) {
    conf.headers = {}
  }
  if (context.session.value.token != null) {
    conf.headers.Token = context.session.value.token
  }
  if (conf.data !== undefined && conf.method !== 'get') {
    const name = conf.data.constructor.name
    if (name !== 'FormData' && ((conf.headers['Content-Type'] || '') as string).indexOf('json') === -1) {
      conf.data = qs.stringify(conf.data)
    }
  }
  return conf
})
// axios响应拦截器 拦截所有错误请求 默认弹框
inst.interceptors.response.use(
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
      context.session.value.setUserInfo(getPublicUser())
    }
    err.msg = msg || err.response.data.message || (Math.trunc(status / 100) == 5 ? '服务器错误' : '未知错误')
    err.code = err.response.data.code
    err.status = status
    err.toString = () => {
      return err.msg
    }
    return Promise.reject(err)
  }
)

export default inst
