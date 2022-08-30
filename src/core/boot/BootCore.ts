import { BootContext, BootProcessor } from './../model'
import { createApp } from 'vue'
import router from '@/plugins/router'
import vuetify from '@/plugins/vuetify'
import AppVue from '@/App.vue'
import contextHandler from './BootContextHandler'

const buildApp = () => {
  const app = createApp(AppVue)
  app.use(router)
    .use(vuetify)
  
  return app
}

const processorList:BootProcessor[] = []

const bootContext: BootContext = {
  addProcessor(executor: BootProcessor) {
    processorList.push(executor)
    return this
  },
  start: async function(): Promise<any> {
    const app = buildApp()
    let curIdx = 0
    const executableProcessor = processorList.filter(e => e.execute)
    for(const processor of executableProcessor) {
      if (!processor.execute) {
        continue
      }
      try {
        contextHandler.setBootTaskTitle(`(${curIdx + 1}/${executableProcessor.length})正在处理：${processor.taskName}`)
        await processor.execute(app, contextHandler)
        contextHandler.logInfo(`(${curIdx + 1}/${executableProcessor.length})处理完成：${processor.taskName}`)
      } catch (err) {
        console.error(err)
        contextHandler.logError(`(${curIdx + 1}/${executableProcessor.length})处理失败：${processor.taskName}`)
      } finally {
        curIdx ++
      }
    }
    contextHandler.setBootTaskTitle('加载完成')
    app.mount('#app')

    for(const p of processorList) {
      try {
        p.onFinish && p.onFinish(app, contextHandler)
      } catch (err) {
        console.error(err)
      }
    }
  }
}

export {
  bootContext,
  buildApp
}