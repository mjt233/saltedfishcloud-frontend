import API from 'sfc-common/api'
import { IdType } from 'sfc-common/model'
import { ProgressRecordVO } from 'sfc-common/model/AsyncTaskRecord'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { onMounted, onUnmounted, reactive, ref } from 'vue'

export interface TaskProgOptions {
  /**
   * 任务id
   */
  taskId: IdType

  onUpdate?: (prog: ProgressRecordVO) => void
}

async function getProg(taskId: IdType) {
  const res = (await SfcUtils.request(API.asyncTask.getProg([taskId]))).data.data
  if (!res || res.length == 0) {
    return undefined
  }
  return res[0]
}

/**
 * 获取任务实时执行进度
 * @param taskId 任务id
 */
export function useTaskProg(opt: TaskProgOptions) {
  const { taskId, onUpdate } = opt
  const prog = ref<ProgressRecordVO>()
  let isUnmounted = false

  async function refresh() { 
    isLoading = true
    try {
      const r = await getProg(taskId)
      if (r) {
        prog.value = reactive(r)
        onUpdate?.(prog.value)
      }
    } catch(e) {
      console.error(e)
    } finally {
      isLoading = false
    }
  }

  async function loopUpdateProg() { 
    while (!isUnmounted) {
      await refresh()
      await SfcUtils.sleep(1000)
      // 满进度了就退出循环
      if (prog.value && prog.value.record.total > 0 && prog.value.record.loaded == prog.value.record.total) {
        break
      }
    }
  }

  let isLoading = false

  onMounted(async() => {
    await refresh()
    SfcUtils.sleep(1000)
    loopUpdateProg()
  })

  onUnmounted(() => {
    isUnmounted = true
  })

  return prog
}