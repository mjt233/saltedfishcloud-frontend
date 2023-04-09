import { mountGlobalAttr } from 'sfc-common/core/boot/globalmount'
import 'sfc-common/styles/common.scss'
import bootContext from 'sfc-common/core/boot'
import { buildApp } from 'sfc-common/core/boot/AppFactory'
import App from 'sfc-common/App.vue'


async function start() {
  // 异步挂载SfcCommon模块和全局属性，避免内部直接循环依赖
  mountGlobalAttr()
  const SfcCommon = await import('../sfc-common')
  window.SfcCommon = SfcCommon

  // 拓展调试用的导入
  if (import.meta.env.DEV) {
    const tasks = [] as Promise<any>[]
    (import.meta.env.VITE_PLUGINS as string)?.split(',')?.forEach(async pluginName => {
      const module = `../sfc-ext/${import.meta.env.VITE_PLUGIN_PREFIX}-${pluginName}/main`
      tasks.push(import(/* @vite-ignore */module))
    })
    await Promise.all(tasks)
  }
  bootContext.start(buildApp(App))
}

start()