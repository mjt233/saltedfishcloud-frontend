import 'sfc-common/styles/common.scss'
import bootContext from 'sfc-common/core/boot'
import { buildApp } from 'sfc-common/core/boot/AppFactory'
import 'sfc-common/core/boot/globalmount'
import App from 'sfc-common/App.vue'


// 拓展调试用的导入
if (import.meta.env.DEV) {
  (import.meta.env.VITE_PLUGINS as string)?.split(',')?.forEach(pluginName => {
    import(/* @vite-ignore */`../sfc-ext/${import.meta.env.VITE_PLUGIN_PREFIX}-${pluginName}/main`)
  }) 
}
bootContext.start(buildApp(App))