import { LoadingManager } from './LoadingManager'
import SfcUtils from './SfcUtils'

export type ObjectKey<T> = Exclude<keyof T, number | symbol>
/**
 * 拦截处理器
 */
export interface InterceptorHandler<T extends Object> {
  /**
   * @param targetInvoker 目标方法函数
   * @param args 调用原方法时传入的参数
   * @param name 被调用的方法名称
   * @returns 方法调用返回值
   */
  (targetInvoker: Function, args: any[], name: ObjectKey<T>): any
}

/**
 * 无效策略
 */
export type InvalidStrategy = 'undefined' | 'error' | 'reject' | 'resolve'

/**
 * 节流选项
 */
export interface ThrottleOptions {
  /**
   * 节流延迟，默认1000（单位ms）
   */
  delay?: number

  /**
   * 是否处理节流等待期间发起的最后一个请求（默认false）
   */
  afterExecute?: boolean

  /**
   * 节流方法匹配器，对象每次执行方法前都会调用该方法，当该返回true时则表示该方法需要节流。
   * 默认所有调用均节流
   * @param name 方法名
   * @param args 方法参数
   */
  mather?: (name: string, args: any[]) => boolean

  /**
   * 因节流而导致方法体执行无效的返回值策略
   */
  invalidStrategy?: InvalidStrategy
}

export namespace MethodInterceptor {
  /**
   * 将函数封装为一个对象
   * @param target 待封装的目标函数
   */
  export function wrapFun<T extends Function>(target: T): { invoke: T } {
    return {
      invoke: target
    }
  }
  /**
   * 创建一个方法调用时会被自定义拦截器操作的被代理对象
   * @param target 被代理的目标对象
   * @param handler 方法拦截处理器，当目标对象的方法被调用时会触发该方法，该方法的返回值将替代目标方法的返回值
   */
  export function createProxy<T extends Object>(target: T,handler: InterceptorHandler<T>) {
    if (target instanceof Function) {
      return ((...args: any) => {
        return handler(target, args, target.name as ObjectKey<T>)
      }) as any as T
    }
    return new Proxy(target, {
      get(target, key, recever) {
        const targetAtt = Reflect.get(target, key, recever)
        if (!(targetAtt instanceof Function)) {
          return targetAtt
        }

        const invoker = (args: any) => {
          return (targetAtt as () => void).apply(target, args)
        }

        return (...args: any) => {
          return handler(invoker, args, String(key) as ObjectKey<T>)
        }
      }
    })
  }
  /**
   * 创建一个自动管理loading状态的代理对象，方法开始执行时启动loading，结束后关闭loading。
   * 支持Promise
   * @param target 被代理对象
   * @param loading loading控制响应式引用对象
   */
  export function createAutoLoadingProxy<T extends Object>(target: T, loading: LoadingManager): T {
    return MethodInterceptor.createProxy(target, (invoker, args, name) => {
      const ret = invoker(args)
      if (!(ret instanceof Promise)) {
        return ret
      }
      loading.beginLoading()
      return new Promise((resolve, reject) => {
        ret.then(resolve)
          .catch(reject)
          .finally(() => {
            loading.closeLoading()
          })
      })
    })
  }
  /**
   * 创建一个方法有自动异常捕获的对象，当方法执行出现异常或Promise出现reject时会触发默认的气泡提示。
   * @param target 被代理对象
   * @param throwError 出现异常时是否继续抛出
   * @returns 代理后的对象，执行方法出现异常时会自动弹出气泡提示
   */
  export function createAutoCatch<T extends Object>(target: T, throwError: boolean = true): T {
    return MethodInterceptor.createProxy(target, (invoker, args, name) => {
      try {
        const ret = invoker(args)
        if (ret instanceof Promise) {
          return ret.catch(err => {
            SfcUtils.snackbar(err)
            if (throwError) {
              return Promise.reject(err)
            }
          })
        } else {
          return ret
        }
      } catch(err) {
        SfcUtils.snackbar(err)
        if (throwError) {
          throw err
        }
      }
    })
  }
  function returnInvalidVal(strategy: InvalidStrategy) {
    if (strategy == 'undefined') {
      return undefined
    } else if (strategy == 'error') {
      throw new Error('操作太快了')
    } else if (strategy == 'reject') {
      return Promise.reject('操作太快了')
    } else {
      return Promise.resolve('invalid')
    }
  }
  /**
   * 创建节流代理对象
   * @param target 被代理对象
   * @param opt 节流选项
   */
  export function createThrottleProxy<T extends Object>(target: T, opt: ThrottleOptions = {}):T {
    const {
      afterExecute = false,
      delay = 1000,
      mather = () => true,
      invalidStrategy = 'undefined'
    } = opt
    const lastExecuteMap = new Map<string, number>()
    const afterExecuteMap = new Map<string, NodeJS.Timeout>()
    const lastArgsMap = new Map<string, any>()
    return MethodInterceptor.createProxy(target, (invoker, args, funcName) => {

      // 无需节流
      if(!mather(funcName, args)) {
        return invoker(args)
      }
      lastArgsMap.set(funcName, args)
      const lastExecute = lastExecuteMap.get(funcName)
      const now = new Date().getTime()

      // 需要等待的时间：节流延迟间隔 - 距离上次执行的间隔
      const needWait = delay - (now - (lastExecute || 0))

      // 可以执行
      if (needWait <= 0) {
        lastExecuteMap.set(funcName, now)
        return invoker(args)
      }
      
      // 不可执行
      if (afterExecute && !afterExecuteMap.get(funcName)) {

        // 但存在延迟后置处理
        const timeout = setTimeout(() => {
          lastExecuteMap.set(funcName, now + needWait)
          invoker(lastArgsMap.get(funcName))
          afterExecuteMap.delete(funcName)
        }, needWait)
        afterExecuteMap.set(funcName, timeout)
      }
      

      return returnInvalidVal(invalidStrategy)
    })
  }
  /**
   * 创建一个异步执行代理对象，组合了自动异常捕获处理和自动加载管理功能
   * @param target 被代理对象
   * @param throwErr 出错是否抛出错误
   * @param manager 加载管理器
   */
  export function createAsyncActionProxy<T extends Object>(target: T, throwErr: boolean, manager: LoadingManager) {
    return createAutoCatch(createAutoLoadingProxy(target, manager), throwErr)
  }
}