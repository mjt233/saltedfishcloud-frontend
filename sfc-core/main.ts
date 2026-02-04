import { mountGlobalAttr } from 'sfc-common/core/boot/globalmount'
import 'sfc-common/styles/common.scss'
import bootContext from 'sfc-common/core/boot'
import { buildApp } from 'sfc-common/core/boot/AppFactory'
import App from 'sfc-common/App.vue'
import { getContext } from 'sfc-common/core'


async function start() {
  // 异步挂载SfcCommon模块和全局属性，避免内部直接循环依赖
  mountGlobalAttr()
  const SfcCommon = await import('../sfc-common')
  window.SfcCommon = SfcCommon

  // 拓展调试用的导入
  if (import.meta.env.DEV) {
    const tasks = [] as Promise<any>[]
    (import.meta.env.VITE_PLUGINS as string)?.split(',')?.forEach(async pluginName => {
      console.log(`[Vite开发模式]加载插件模块: ${pluginName}`)
      const module = `../sfc-ext/${import.meta.env.VITE_PLUGIN_PREFIX}-${pluginName}/main`
      tasks.push(import(/* @vite-ignore */module))
    })
    await Promise.all(tasks)
  }
  bootContext.addProcessor({
    taskName: '初始化菜单',
    execute: () => {
      const boxMenus = getContext().menu.value.boxMenu
      // 修改原数组，将对象的id字段为"more"的移动到数组最后面
      // 1. 找到 id 为 "more" 的元素索引
      const index = boxMenus.findIndex(item => item.id === 'more')

      // 2. 如果存在，且不在已经是最后一位的情况下
      if (index > -1 && index !== boxMenus.length - 1) {
        // 3. 从原位置删除该元素 (splice 返回被删除元素的数组，取第一个)
        const [item] = boxMenus.splice(index, 1)
  
        // 4. 将其添加到数组末尾
        boxMenus.push(item)
      }
      
    }
  })
  bootContext.start(buildApp(App))
}

start()