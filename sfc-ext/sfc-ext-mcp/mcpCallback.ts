import axios, { AxiosResponse } from 'axios'
import { McpOauthApi } from './api'
import { ApiRequest } from 'sfc-common/model'
import { McpOAuthCallbackData } from './model'

async function doCallback() {

  if(!window.opener) {
    alert('请在咸鱼云主站完成授权绑定，勿直接访问此页面')
    return
  }
  const curUrl = new URL(location.href)
  const code = curUrl.searchParams.get('code')
  if (!code) {
    alert('缺少code参数，无法完成授权回调')
    return
  }
  try {
    const apiTicket = await getApiTicket(code)
    const isSuccess = !!apiTicket;
    (window.opener as Window).postMessage({
      apiTicket,
      msg: isSuccess ? '授权成功' : '授权失败',
      isSuccess,
      type: 'McpOAuthCallbackData'
    } as McpOAuthCallbackData)
  } catch (e) {
    console.error(e);
    
    (window.opener as Window).postMessage({
      isSuccess: false,
      msg: e + '',
      type: 'McpOAuthCallbackData'
    } as McpOAuthCallbackData)
  } finally {
    window.close()
  }
}
async function getApiTicket(code: string) {
  const res = await request(McpOauthApi.getApiTicket(code))
  return res.data.data
}

function getAxiosInst() {
  
  const axiosInst = axios.create()
  axiosInst.defaults.baseURL = '/api'
  axiosInst.interceptors.response.use(
    conf => {
      if(conf.data.code && conf.data.code != 200) {
        return Promise.reject(conf.data.msg)
      } else {
        return conf
      }
    }
  )
  return axiosInst
}


/**
 * 发起API请求
 * @param request API请求参数
 * @returns Axios响应对象
 */
async function request <T>(request: ApiRequest<T>): Promise<AxiosResponse<T, any>> {
  return await getAxiosInst()(request)
}

doCallback()