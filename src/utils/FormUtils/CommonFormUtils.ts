import { AxiosRequestConfig } from 'axios'
/**
 * 使用POST带表单数据的方式打开新窗口
 * @param {String} url 目标地址
 * @param {Boolean} newWindow 是否在新窗口打开
 * @param {Object} filed 附加的表单字段
 */
function jumpWithPost(url: string, newWindow: boolean, filed: any) {
  const form = document.createElement('form')
  form.action = url
  form.method = 'post'
  if (newWindow) {
    form.target = '_blank'
  }
  for (const key in filed) {
    if (Object.hasOwnProperty.call(filed, key)) {
      const value = filed[key]
      const input = document.createElement('input')
      input.name = key
      input.value = value
      form.appendChild(input)
    }
  }
  form.style.display = 'none'
  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
}

/**
 * 标记axios请求配置使用json请求
 * @param config axios配置
 */
function useJsonBody(config: AxiosRequestConfig) {
  if (!config.headers) {
    config.headers = {
      'Content-Type': 'application/json'
    }
  } else {
    config.headers['Content-Type'] = 'application/json'
  }
  return config
}

export {
  jumpWithPost,
  useJsonBody
}
