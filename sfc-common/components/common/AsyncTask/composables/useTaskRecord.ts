import API from 'sfc-common/api'
import { IdType } from 'sfc-common/model'
import { AsyncTaskRecord } from 'sfc-common/model/AsyncTaskRecord'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { onMounted, onUnmounted, ref } from 'vue'

export interface UseTaskRecordOptions {
  /**
   * 任务退出时的回调（状态从等待中/执行中/离线 变为其他状态时触发）
   */
  onTaskExit?: (taskId: IdType, taskRecord: AsyncTaskRecord) => void

  /**
   * 任务信息加载完成后的回调
   */
  onLoaded?: (taskRecord: AsyncTaskRecord | null) => void
}

// 需要等待的状态：等待中(0)、执行中(1)、任务离线(5)
const WAITING_STATUS = [0, 1, 5]

/**
 * 获取异步任务信息的组合式函数
 * @param taskId 任务ID
 * @param options 配置选项
 */
export function useTaskRecord(taskId: IdType, options: UseTaskRecordOptions = {}) {
  const { onTaskExit, onLoaded } = options

  const taskRecord = ref<AsyncTaskRecord>()
  let isUnmounted = false

  /**
   * 加载任务详情
   */
  const loadData = async() => {
    const result = (await SfcUtils.request(API.asyncTask.getById(taskId))).data.data
    taskRecord.value = result
    return result
  }

  /**
   * 检查是否需要等待任务退出
   */
  const needWaiting = () => {
    return WAITING_STATUS.includes(taskRecord.value?.status ?? -1)
  }

  /**
   * 等待任务退出（使用 waitTaskExit API 循环等待）
   */
  const waitTaskExitLoop = async() => {
    while (!isUnmounted && needWaiting()) {
      try {
        const exited = (await SfcUtils.request(API.asyncTask.waitTaskExit(taskId, 5))).data.data
        if (exited) {
          // 任务已退出，刷新任务信息
          await loadData()
          // 触发退出回调
          if (taskRecord.value && !isUnmounted) {
            onTaskExit?.(taskId, taskRecord.value)
          }
          break
        }
        // 超时未退出，继续循环等待
      } catch (err) {
        console.error('等待任务退出出错:', err)
        // 出错时短暂等待后重试
        await SfcUtils.sleep(1000)
      }
    }
  }

  /**
   * 初始化加载并启动必要的等待循环
   */
  const init = async() => {
    await loadData()
    onLoaded?.(taskRecord.value || null)
    await waitTaskExitLoop()
  }

  onMounted(() => {
    init()
  })

  onUnmounted(() => {
    isUnmounted = true
  })

  return taskRecord
}
