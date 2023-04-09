import 'sfc-common/styles/common.scss'
import bootContext from 'sfc-common/core/boot'
import { buildApp } from 'sfc-common/core/boot/AppFactory'
import 'sfc-common/core/boot/globalmount'
import App from 'sfc-common/App.vue'
import { initContext } from 'sfc-common'


async function start() {
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

initContext()
start()