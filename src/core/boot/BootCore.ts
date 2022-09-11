import { BootContext, BootProcessor } from './../model'
import AppVue from '@/App.vue'
import contextHandler from './BootContextHandler'
import SfcUtils from '@/utils/SfcUtils'
import { buildApp } from './AppFactory'

const processorList:BootProcessor[] = []

let curIdx = 0
const bootContext: BootContext = {
  addProcessor(executor: BootProcessor) {
    processorList.push(executor)
    return this
  },
  start: async function(): Promise<any> {
    const app = buildApp(AppVue)
    const executableProcessor = processorList.filter(e => e.execute)
    contextHandler.updateProgress(executableProcessor.length, 0)
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
        contextHandler.setInterruptMsg('流程失败：' + processor.taskName)
        return err
      } finally {
        curIdx ++
        contextHandler.updateProgress(executableProcessor.length, curIdx)
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