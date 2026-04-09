import API from 'sfc-common/api'
import { IdType } from 'sfc-common/model'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { onUnmounted, ref, type Ref, type ComputedRef } from 'vue'
import { WebSocketService } from 'sfc-common/core/serivce/WebSocketService'

export interface UseTaskLogTextOptions {
  /**
   * 任务状态，用于判断日志加载方式
   */
  taskStatus: Ref<number | undefined> | ComputedRef<number | undefined> | (() => number | undefined)
}

/**
 * 获取异步任务日志的组合式函数
 * @param taskId 任务ID
 * @param options 配置选项
 */
export function useTaskLogText(taskId: IdType, options: UseTaskLogTextOptions) {
  const { taskStatus } = options

  const logText = ref('')
  const isShowLog = ref(false)

  // WebSocket 连接
  let ws: WebSocket | undefined
  // AJAX 轮询定时器
  let ajaxTimer: any
  // AJAX 加载中标记
  let ajaxLoading = false
  let isUnmounted = false

  /**
   * 获取任务状态
   */
  const getStatus = () => {
    if (typeof taskStatus === 'function') {
      return taskStatus()
    }
    return taskStatus.value
  }

  /**
   * 清理资源
   */
  const clear = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close()
      ws = undefined
      console.log('已清理ws连接')
      isShowLog.value = false
    }
    if (ajaxTimer) {
      clearInterval(ajaxTimer)
      ajaxTimer = undefined
      console.log('已停止轮询')
      isShowLog.value = false
    }
  }

  /**
   * 通过 AJAX 加载日志
   */
  const loadLogByAjax = async() => {
    if (ajaxLoading) {
      return
    }
    try {
      ajaxLoading = true
      const logData = (await SfcUtils.request(API.asyncTask.getLog(taskId))).data.data
      if (logData) {
        logText.value = logData
      } else {
        logText.value = '无日志'
      }
    } catch (err) {
      console.error(err)
      SfcUtils.snackbar('日志加载出错: ' + err)
    } finally {
      ajaxLoading = false
    }
  }

  /**
   * 通过 WebSocket 加载实时日志
   */
  const loadLogByWs = async() => {
    const websocket = await WebSocketService.connect({
      onMessage(msg) {
        logText.value += `${msg.data}\n`
      }
    })
    WebSocketService.subscribeAsyncTaskLog(websocket, taskId)
    return websocket
  }

  /**
   * 开始加载日志数据
   */
  const startLoadLogData = async() => {
    isShowLog.value = true
    
    const status = getStatus()
    // 如果任务不是执行中状态，直接一次性获取日志
    if (status != 1) {
      console.log('任务不在执行状态，获取一次性历史日志')
      await loadLogByAjax()
      return
    }
    try {
      // 先获取当前历史日志
      await loadLogByAjax()
      console.log('已获取历史日志')
      // 通过 WebSocket 获取追加的日志
      ws = await loadLogByWs()
      ws.addEventListener('close', () => {
        console.log('ws 已断开')
      })
      console.log('已连接websocket')
    } catch (err) {
      // 如果 WebSocket 出错了就用轮询
      SfcUtils.snackbar('连接 WebSocket 服务失败，无法实时获取日志，改为轮询')
      await loadLogByAjax()
      ajaxTimer = setInterval(async() => {
        await loadLogByAjax()
        const currentStatus = getStatus()
        if (currentStatus != 1 && currentStatus != 5) {
          if (ajaxTimer) {
            clearInterval(ajaxTimer)
          }
          return
        }
      }, 1000)
    } finally {
      if (isUnmounted) {
        clear()
      }
    }
  }

  onUnmounted(() => {
    isUnmounted = true
    clear()
  })

  return {
    /**
     * 日志内容
     */
    logText,
    /**
     * 日志是否可以显示
     */
    isShowLog,

    /**
     * 开始加载日志数据
     */
    startLoadLogData,

    /**
     * 清理资源
     */
    clear
  }
}
