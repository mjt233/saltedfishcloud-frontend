import API from 'sfc-common/api'
import { StringUtils, LoadingManager } from 'sfc-common/utils'
import { VBtn } from 'vuetify/components'
import { FileOpenHandler } from 'sfc-common/core/context/type'

import { ApiRequest, FileInfo, FileListContext } from 'sfc-common/model'
import { snackbar } from './common/SnackBar'
import axios from 'sfc-common/plugins/axios'
import { AxiosError, AxiosResponse } from 'axios'
import * as dialog from './common/Dialog'
import * as fileSelector from './file/fileSelector'
import { context } from 'sfc-common/core/context'
import FileOpenSelectorVue from 'sfc-common/components/common/FileOpenSelector.vue'
import { dyncmount } from './common/DyncMount'
import { h } from 'vue'

let globalLoadingManager: LoadingManager = new LoadingManager()

const SfcUtils = {
  dyncmount,
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
        console.error(err)
        ret.push(undefined)
      }
      
    } else {
      funcs.forEach(fun => {
        try {
          ret.push(fun(...params))
        } catch(err) {
          console.error(err)
          ret.push(undefined)
        }
      })
    }
    return ret
  },
  isAxiosError(err: any) {
    return (err instanceof AxiosError)
  },
  toAxiosError(err: any):AxiosError {
    return err
  },
  isForbidden(err: any) {
    return this.isAxiosError(err) && this.toAxiosError(err).code == '403'
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
  async copyToClipboard(text: string) {
    if (navigator.clipboard) {
      return await navigator.clipboard.writeText(text)
    }
    const input = document.createElement('div')
    document.body.appendChild(input)
    input.style.position = 'fixed'
    input.style.zIndex = '1145141919'
    input.style.top = '0'
    input.style.left = '0'
    input.innerText = text
    try {
      const sel = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(input)
      sel?.removeAllRanges()
      sel?.addRange(range)
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
  },
  /**
   * 获取api配置中对应的绝对路径
   * @param apiConfig api配置
   */
  getApiUrl(apiConfig: any) {
    return StringUtils.appendPath(API.getDefaultPrefix(), apiConfig.url)
  },
  /**
   * 新窗口打开API配置中的URL
   * @param apiConfig API配置
   */
  openApiUrl(apiConfig: any) {
    this.openUrl(this.getApiUrl(apiConfig))
  },
  /**
   * 打开“文件打开方式选择”对话框
   * @param ctx 文件列表上下文
   * @param file 文件信息
   * @param handlerOptions 文件打开方式列表或分组
   */
  openFileOpenSelectorDialog(ctx: FileListContext, file: FileInfo, handlerOptions: {handlers?: FileOpenHandler[], handlerGroups?: {name: string, handlers: FileOpenHandler[]}[] }) {
    const { handlers, handlerGroups} = handlerOptions
    const inst = this.openComponentDialog(FileOpenSelectorVue, {
      props: {
        ctx,
        file,
        handlers,
        handlerGroups,
        onSelect(handler: FileOpenHandler) {
          handler.action(ctx, file)
          inst.close()
        }
      },
      title: '选择打开方式',
      dense: true,
      showConfirm: false,
      showCancel: false,
      footer: () => h(VBtn, {color: 'primary', onClick: () => inst.close()}, () => '关闭')
    })
  },
  /**
   * 打开文件
   * @param ctx 文件列表上下文
   * @param file 文件信息
   */
  openFile(ctx: FileListContext, file: FileInfo) {
    const handlers = context.fileOpenHandler.value.filter(e => e.matcher(ctx, file))
    if (handlers.length == 1) {
      handlers[0].action(ctx, file)
    } else if (handlers.length == 0) {
      this.snackbar('无合适的打开方式')
    } else if (handlers.length == 2 && handlers[1].isDefault) {
      handlers[1].action(ctx, file)
    } else {
      this.openFileOpenSelectorDialog(ctx, file, {handlers})
    }
  },
  beginLoading() {
    if (globalLoadingManager) {
      globalLoadingManager.beginLoading()
    }
  },
  closeLoading() {
    if (globalLoadingManager) {
      globalLoadingManager.closeLoading()
    }
  },
  setGlobalLoadingManager(m: LoadingManager) {
    globalLoadingManager = m
  },
  getGlobalLoadingManager() {
    return globalLoadingManager
  },
  /**
   * 获取系统特性信息
   * @param prefix 配置项前缀
   * @param key 配置项
   */
  getSystemFeature(prefix: string, key: string) {
    return context.feature.value[prefix] && context.feature.value[prefix][key]
  }
}

export default SfcUtils
export {
  SfcUtils
}