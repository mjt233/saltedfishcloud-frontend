import { LoadingManager } from './LoadingManager'
import SfcUtils from './SfcUtils'
/**
 * 拦截处理器
 */
export interface InterceptorHandler {
  /**
   * @param targetInvoker 目标方法函数
   * @param args 调用原方法时传入的参数
   * @param name 被调用的方法名称
   * @returns 方法调用返回值
   */
  (targetInvoker: Function, args: any[], name: string): any
}

const MethodInterceptor = {
  /**
   * 创建一个方法调用时会被自定义拦截器操作的被代理对象
   * @param target 被代理的目标对象
   * @param handler 方法拦截处理器，当目标对象的方法被调用时会触发该方法，该方法的返回值将替代目标方法的返回值
   */
  createProxy<T extends Object>(target: T,handler: InterceptorHandler) {
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
          return handler(invoker, args, String(key))
        }
      }
    })
  },
  /**
   * 创建一个自动管理loading状态的代理对象，方法开始执行时loading设为true，结束后设置为false。
   * 支持Promise
   * @param target 被代理对象
   * @param loading loading控制响应式引用对象
   */
  createAutoLoadingProxy<T extends Object>(target: T, loading: LoadingManager): T {
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
  },
  /**
   * 创建一个方法有自动异常捕获的对象，当方法执行出现异常或Promise出现reject时会触发默认的气泡提示。
   * @param target 被代理对象
   * @param throwError 出现异常时是否继续抛出
   * @returns 代理后的对象，执行方法出现异常时会自动弹出气泡提示
   */
  createAutoCatch<T extends Object>(target: T, throwError: boolean = true): T {
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
}

export {
  MethodInterceptor
}