
import { ApiRequest } from '@/core/model'
// import selectFile from './file/fileSelector'
// import previewImage from './preview/previewImage'
import { snackbar } from './common/SnackBar'
import axios from '@/plugins/axios'
import { AxiosResponse } from 'axios'
import * as dialog from './common/Dialog'
import * as fileSelector from './file/fileSelector'

const SfcUtils = {
  snackbar,
  /**
   * 原始默认预设配置的axios对象
   */
  axios,

  batchInvokeFunction(funcs: Function[] | Function,...params: any[]): any[] {
    
    const ret = []
    if (funcs instanceof Function) {
      try {
        ret.push(funcs(...params))
      } catch(err) {
        console.log(err)
        ret.push(undefined)
      }
      
    } else {
      funcs.forEach(fun => {
        try {
          ret.push(fun(...params))
        } catch(err) {
          console.log(err)
          ret.push(undefined)
        }
      })
    }
    return ret
  },
  
  /**
   * 发起API请求
   * @param request API请求参数
   * @returns Axios响应对象
   */
  async request <T>(request: ApiRequest<T>): Promise<AxiosResponse<T, any>> {
    
    return await axios(request)
  },
  ...dialog,
  ...fileSelector,
  sleep(timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, timeout)
    })
  },
  /**
   * 将文本复制到剪切板
   * @param text 待复制的文本
   */
  copyToClipboard(text: string) {
    const input = document.createElement('textarea')
    input.readOnly = true
    input.value = text
    document.body.appendChild(input)
    input.select()
    input.setSelectionRange(0, text.length)
    try {
      document.execCommand('copy')
    } finally {
      document.body.removeChild(input)
    }
  },

  /**
   * 在新窗口中打开url
   * @param url 要打开的url
   */
  openUrl(url: string) {
    const a = document.createElement('a')
    a.target = '_blank'
    a.href = url
    a.text = url
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}

export default SfcUtils
export {
  SfcUtils
}