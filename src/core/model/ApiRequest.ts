import { JsonResult } from './JsonResult'
import { AxiosRequestConfig } from 'axios'


/**
 * 最原始的API请求类型封装，仅使用泛型作为Axios响应data类型
 */
export interface ApiRequest<T> extends AxiosRequestConfig {
  [otherKey: string]: any
}

/**
 * 默认的通用API请求配置，使用JsonResult包裹响应作为Axios响应data类型
 */
export type CommonRequest<T=null> = ApiRequest<JsonResult<T>>

/**
 * 数据分页查询结果信息
 */
export interface PageInfo<T> {
  // 数据总量
  total: number

  // 数据列表
  list: T[]
  
  // 当前查询页码
  pageNum: number

  // 每页大小
  pageSize: number

  // 本页大小
  size: number
  
  // 总页数
  pages: number

  isFirstPage: boolean
  isLastPage: boolean
}

/**
 * JPA分页查询结果信息
 */
export interface JpaPageInfo<T> {
  content: T[]

  size: number

  totalPages: number

  totalElements: number
}

/**
 * 分页请求标准参数
 */
export interface PageRequestParam {
  params?: {
    /**
     * 查询的页码（1为第一页），默认1
     */
    page?: number

    /**
     * 每页数据大小，默认10
     */
    size?: number,
    [otherKey: string]: any
  }
}

/**
 * 标准数据分页查询请求
 */
export type PageRequest<T> = CommonRequest<PageInfo<T>> & PageRequestParam