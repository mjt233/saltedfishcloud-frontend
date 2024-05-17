import { API } from 'sfc-common/index'
import { IdType, ProxyInfo } from 'sfc-common/model'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { reactive } from 'vue'

export type ProxyTestStatus = 'pass'|'testing'|'failed'|'notest'

export function createProxyTester() {
  const testResult = reactive({}) as {[proxyId: IdType]: ProxyTestStatus}
  return {
    getReactiveResult: () => testResult,
    testProxy(proxy: ProxyInfo, useCache?: boolean) {
      testResult[proxy.id] = 'testing'
      return SfcUtils.request(API.proxy.test(proxy.id, 10000, useCache))
        .then(res => {
          testResult[proxy.id] = res.data.data ? 'pass' : 'failed'
        })
        .catch(err => {
          testResult[proxy.id] = 'failed'
          return Promise.reject(err)
        })
    },
    testAllProxy(proxyList: ProxyInfo[], useCache?: boolean) {
      return Promise.all(proxyList.map(e => this.testProxy(e, useCache)))
    }
  }
}