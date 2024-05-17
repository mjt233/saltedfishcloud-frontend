import { context } from 'sfc-common/core/context'
import { getPublicUser } from 'sfc-common/core/context/session'
import axios from 'axios'
import qs from 'qs'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { h } from 'vue'
import { API, StringUtils } from 'sfc-common/index'

function showEmegrencyInfo() {
  setTimeout(() => {
    const component = () => [
      h('iframe', {
        src: StringUtils.appendPath(API.getDefaultPrefix(), '/errorView'),
        style: {
          'border': 'none',
          'width': '100%',
          'height': 'calc(100% - 81px)'
        }
      })
    ]
    SfcUtils.openComponentDialog(component, {
      title: '启动失败',
      persistent: true,
      fullscreen: true,
      onConfirm() {
        location.reload()
        return false
      },
      extraDialogOptions: {
        confirmText: '重试'
      },
      showCancel: false
    })
  }, 10)
}

const inst = axios.create()
inst.defaults.baseURL = '/api'
inst.defaults.withCredentials = true
inst.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded'

// axios请求拦截器 添加token 和转换表单数据类型
inst.interceptors.request.use(conf => {
  if (!conf.headers) {
    conf.headers = {}
  }
  if (context.session.value.token != null && context.session.value.token.length > 0) {
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
  conf => {
    if(conf.data.code && conf.data.code != 200) {
      return Promise.reject(conf.data.msg)
    } else {
      return conf
    }
  },
  err => {
    // 判断系统是否启动失败了
    const isEmergency = err?.response?.headers && err.response.headers['is-emergency'] == '1'
    if (isEmergency) {
      showEmegrencyInfo()
      return Promise.reject(err)
    }


    // 常规包装信息 msg、code、status 三个字段，确保在任何情况下都能获取到
    const status = err.status || err.response.status
    const msg = err?.response?.data?.msg
    if (status === 401) {
      context.session.value.setUserInfo(getPublicUser())
    }
    err.msg = msg || err?.response?.data?.message || (Math.trunc(status / 100) == 5 ? '服务器错误' : (err.toString() || '未知错误'))
    err.code = err?.response?.data?.code || -1
    err.status = status
    err.toString = () => {
      return err.msg
    }
    return Promise.reject(err)
  }
)

export default inst
