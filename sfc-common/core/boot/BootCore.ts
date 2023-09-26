import { BootContext, BootProcessor } from 'sfc-common/model'
// import AppVue from 'sfc-common/App.vue'
import contextHandler from './BootContextHandler'
import { App } from 'vue'
import SfcUtils from 'sfc-common/utils/SfcUtils'

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
        const errMsg = `(${curIdx + 1}/${processorList.length})处理失败：${processor.taskName}`
        contextHandler.logError(errMsg)
        contextHandler.setInterruptMsg('流程失败：' + processor.taskName)
        try {
          await SfcUtils.confirm(`初始化加载错误: ${errMsg}，是否忽略？`, '加载错误', { cancelToReject: true })
        } catch {
          return err
        }
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