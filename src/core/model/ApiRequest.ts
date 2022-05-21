import { JsonResult } from './JsonResult'
import { AxiosRequestConfig } from 'axios'

/**
 * 默认的通用API请求配置，使用JsonResult包裹响应作为Axios响应data类型
 */
export interface CommonRequest<T=null> extends ApiRequest<JsonResult<T>> {
}

/**
 * 最原始的API请求类型封装，仅使用泛型作为Axios响应data类型
 */
export interface ApiRequest<T> extends AxiosRequestConfig {
  [otherKey: string]: any
}