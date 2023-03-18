import { BootContext, BootProcessor } from 'sfc-common/model'
// import AppVue from 'sfc-common/App.vue'
import contextHandler from './BootContextHandler'
import { buildApp } from './AppFactory'
import { App } from 'vue'

const processorList:BootProcessor[] = []

let curIdx = 0
const bootContext: BootContext = {
  addProcessor(executor: BootProcessor) {
    processorList.push(executor)
    return this
  },
  start: async function(app: App<Element>): Promise<any> {
    for(const processor of processorList) {
      if (!processor.execute) {
        continue
      }
      try {
        contextHandler.setBootTaskTitle(`(${curIdx + 1}/${processorList.length})正在处理：${processor.taskName}`)
        await processor.execute(app, contextHandler)
        contextHandler.logInfo(`(${curIdx + 1}/${processorList.length})处理完成：${processor.taskName}`)
      } catch (err) {
        console.error(err)
        contextHandler.logError(`(${curIdx + 1}/${processorList.length})处理失败：${processor.taskName}`)
        contextHandler.setInterruptMsg('流程失败：' + processor.taskName)
        return err
      } finally {
        curIdx ++
        contextHandler.updateProgress(processorList.length, curIdx)
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
  bootContext
}