import axios, { AxiosRequestConfig, AxiosResponse }  from 'axios'
import { ApiRequest, IdType } from 'sfc-common'
import sys from 'sfc-common/api/sys'
import user from 'sfc-common/api/user'
import { LoadingManager } from 'sfc-common/utils/LoadingManager'
import { createApp, Ref, ref } from 'vue'
import { AuthorityItem } from './model'
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


/**
 * 发起API请求
 * @param request API请求参数
 * @returns Axios响应对象
 */
export async function request <T>(request: ApiRequest<T>): Promise<AxiosResponse<T, any>> {
  return await axiosInst(request)
}

export function createAutoLoadingProxy<T extends Object>(target: T, loading: LoadingManager): T {
  const proxyObj = {} as {[key: string]: any}
  const originObj = target as any
  Object.keys(originObj).forEach(key => {
    const originMethod = originObj[key]

    // 不是函数，直接复制原始值
    if (!(originMethod instanceof Function)) {
      proxyObj[key] = originMethod
      return
    }

    proxyObj[key] = function(...args: any[]) {
      loading.beginLoading()
      let isPromise = false
      try {
        const res = (originMethod as Function).apply(target, args)
        isPromise = res instanceof Promise
        if (isPromise) {
          return res.finally(() => {
            loading.closeLoading()
          })
        }
        return res
      } finally {
        if (!isPromise) {
          loading.closeLoading()
        }
      }
    }
  })
  return proxyObj as any as T
}

export async function getCurUser() {
  try {
    const u = await request(user.getUserInfo())
    return u.data.data
  } catch (err) {
    return null
  }
}

export async function login(username: string, password: string) {
  return (await request(user.login(username, password, true))).data.data
}

export async function getSysFeature() {
  return (await request(sys.getFeature())).data
}

export function useMessage() {
  let curId = 0
  const msgList = ref([]) as Ref<{msg: string, type: 'success' | 'error' | 'warning' | 'info', id: string}[]>
  return {
    msgList,
    addMsg(msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', timeout: number = 5000) {
      const id = curId.toString()
      curId++
      msgList.value.push({msg, type, id})
      setTimeout(() => {
        const idx = msgList.value.findIndex((item) => item.id === id)
        if (idx >= 0) {
          msgList.value.splice(idx, 1)
        }
      }, timeout)
    }
  }
}

const buildinAuthorityList = [
  {
    name: '用户基本信息',
    code: 'profile',
    icon: 'mdi-account-circle',
    describe: '您的用户名、邮箱与头像'
  },
  {
    name: '网盘读取权限',
    code: 'storage_read',
    icon: 'mdi-database',
    describe: '读取您的私人网盘文件与文件列表'
  },
  {
    name: '网盘写入权限',
    code: 'storage_write',
    icon: 'mdi-database',
    describe: '对您的私人网盘文件进行写入、删除、重命名、移动操作',
    isDanger: true
  }
] as AuthorityItem[]

/**
 * 获取授权范围中，系统的有效权限列表
 * @param scope 请求授权范围
 */
export async function getAuthorityList(scope: string) {
  const requireAuthoritySet = new Set(scope.split(' ').filter(e => e.length))
  const serverAuthorityList = buildinAuthorityList
  return serverAuthorityList.filter(e => requireAuthoritySet.has(e.code))
}

export {
  axiosInst
}