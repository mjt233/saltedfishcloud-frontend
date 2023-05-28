<template>
  <div class="async-task-info">
    <LoadingMask :loading="loading" :type="'circular'" />
    <div v-if="!taskRecord" style="height: 120px;">
      <p>加载中...</p>
    </div>
    <div v-else>
      <FormGrid row-height="64px">
        <FormRow>
          <FormCol cols="3" top-label label="任务名">
            {{ taskRecord.name }}
          </FormCol>
          <FormCol cols="3" top-label label="任务类型">
            {{ taskRecord.taskType }}
          </FormCol>
          <FormCol cols="3" top-label label="执行主机">
            <span>{{ taskRecord.executor }}</span>
          </FormCol>
          <FormCol cols="3" top-label label="任务状态">
            <span :class="`status-text-${taskRecord.status}`">{{ AsyncTaskRecordStatusDict[taskRecord.status] }}</span>
          </FormCol>
        </FormRow>
        <FormRow>
          <FormCol cols="3" top-label label="发布日期">
            <span class="status-text-0">{{ StringFormatter.toDate(taskRecord.createAt) }}</span>
          </FormCol>
          <FormCol
            v-if="taskRecord.status != 0"
            cols="3"
            top-label
            label="执行日期"
          >
            <span class="status-text-1">{{ StringFormatter.toDate(taskRecord.executeDate) }}</span>
          </FormCol>
          <FormCol
            v-if="taskRecord.status == 2"
            cols="3"
            top-label
            label="完成日期"
          >
            <span class="status-text-2">{{ StringFormatter.toDate(taskRecord.finishDate) }}</span>
          </FormCol>
          <FormCol
            v-if="[3,4].includes(taskRecord.status)"
            cols="3"
            top-label
            label="失败日期"
          >
            <span class="status-text-3">{{ StringFormatter.toDate(taskRecord.failedDate) }}</span>
          </FormCol>
        </FormRow>
        <FormRow>
          <FormCol top-label label="任务创建人">
            <div class="d-flex align-center justify-center">
              <UserAvatar :uid="taskRecord.uid" />
              <template v-if="createUser?.user">
                {{ createUser.user }}
              </template>
            </div>
          </FormCol>
          <FormCol top-label label="任务参数">
            <div
              v-ripple
              class="text-primary"
              style="cursor: pointer;"
              @click="showParams"
            >
              <CommonIcon icon="mdi-eye" />查看
            </div>
          </FormCol>
        </FormRow>
      </FormGrid>
      <template v-if="![0,5].includes(taskRecord.status)">
        <VDivider style="margin: 6px 0 24px 0;" />
        <p class="tip">
          任务日志
        </p>
        <VBtn v-if="!isShowLog" color="primary" @click="taskLogLoader.startLoadLogData()">
          加载日志
        </VBtn>
        <LogView v-else :log-text="logText" style="height: 60vh;" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  taskId: {
    type: [Number, String] as PropType<IdType>,
    default: 0
  }
})
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()
const taskRecord = ref() as Ref<AsyncTaskRecord | undefined>
const isShowLog = ref(false)
const logText = ref('')
const createUser = ref({}) as Ref<BaseUserInfo>

const actions = MethodInterceptor.createAsyncActionProxy({
  /**
   * 加载任务详情
   */
  async asyncLoadData() {
    return await loadData()
  },
  async asyncLogLog() {
    await taskLogLoader.loadLogByAjax()
  }
}, false, loadingManager)

const loadData = async() => {
  taskRecord.value = (await SfcUtils.request(API.asyncTask.getById(props.taskId))).data.data
  const userResult = (await SfcUtils.request(API.user.findBaseInfoByIds([taskRecord.value.uid]))).data.data
  if (userResult?.length) {
    createUser.value = userResult[0]
  }
}

const formatJsonText = (json: string) => {
  const obj = JSON.parse(json)
  let res = '{'
  Object.keys(obj).forEach(key => {
    res += `\n  "${key}": ${JSON.stringify(obj[key])}`
  })
  res += '\n}'
  return res
}


const taskLogLoader = {
  ws: undefined as WebSocket | undefined,
  ajaxTimer: undefined as NodeJS.Timer | undefined,
  ajaxLoading: false as boolean,
  /**
   * 清除各种事件和定时
   */
  clear() {
    if (this.ws) {
      this.ws.close()
      this.ws = undefined
    }
    if (this.ajaxTimer) {
      clearInterval(this.ajaxTimer)
      this.ajaxTimer = undefined
    }
  },
  /**
   * 开始执行实时日志加载显示
   */
  async startLoadLogData() {
    isShowLog.value = true
    if (taskRecord.value?.status != 1) {
      await actions.asyncLogLog()
      return
    }
    try {
      await this.loadLogByAjax()
      this.ws = await this.loadLogByWs()
      stopAutoRefresh()
    } catch (err) {
      SfcUtils.snackbar('连接WebSocket服务失败，无法实时获取日志，改为轮询')
      this.loadLogByAjax()
      this.ajaxTimer = setInterval(() => {
        this.loadLogByAjax()
      }, 1000)
      stopAutoRefresh()
    } finally {
      await this.waitTaskExit()
      actions.asyncLoadData()
      this.clear()
    }
  },
  async loadLogByWs() {
    const ws = await WebSocketService.connect({
      onMessage(msg) {
        console.log(`onMessage: ${msg}`)
        logText.value += `${msg.data}\n`
      }
    })
    WebSocketService.subscribeAsyncTaskLog(ws, props.taskId)
    return ws
  },
  /**
   * 等待异步任务退出
   */
  async waitTaskExit() {
    const getIsExit = async() => {
      try {
        return (await SfcUtils.request(API.asyncTask.waitTaskExit(props.taskId || 0))).data.data
      } catch (err) {
        console.error(err)
        SfcUtils.snackbar('等待任务出错' + err)
        await SfcUtils.sleep(1000)
        return false
      }
    }
    while (!(await getIsExit())) {
      true
    }
  },
  async loadLogByAjax() {
    try {
      this.ajaxLoading = true
      const logData = (await SfcUtils.request(API.asyncTask.getLog(props.taskId))).data.data
      if (logData) {
        logText.value = logData
      } else {
        logText.value = '无日志'
      }
    } catch (err) {
      console.error(err)
      SfcUtils.snackbar('日志ajax加载出错' + err)
    } finally {
      this.ajaxLoading = false
    }
  }

}

/**
 * 查看任务参数
 */
const showParams = () => {
  SfcUtils.openComponentDialog(CodeEditor, {
    props: {
      modelValue: formatJsonText(taskRecord.value?.params || ''),
      readOnly: true,
      language: 'json',
      style: {
        height: '60vh'
      }
    },
    title: '任务参数',
    showConfirm: false,
    extraDialogOptions: {
      maxWidth: '1000px'
    }
  })
}

let autoRefreshTimer: any
let autoLoading = false
const authRefreshHandler = async() => {
  if (autoLoading) {
    return
  }
  autoLoading = true
  try {
    await loadData()
    if (![0,1,5].includes(taskRecord.value?.status || 3)) {
      clearInterval(autoRefreshTimer)
      autoRefreshTimer = null
    }
  } finally {
    autoLoading = false
  }
}

const stopAutoRefresh = () => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
    autoRefreshTimer = null
  }
}

onMounted(async() => {
  await actions.asyncLoadData()
  // 若任务为等待中或离线，则间隔更新状态
  if ([0,1,5].includes(taskRecord.value?.status || 3)) {
    autoRefreshTimer = setInterval(authRefreshHandler, 5000)
  }
})

onUnmounted(() => {
  stopAutoRefresh()
  taskLogLoader.clear()
})

</script>

<script lang="ts">
import { API } from 'sfc-common/index'
import { BaseUserInfo, IdType } from 'sfc-common/model'
import { AsyncTaskRecord, AsyncTaskRecordStatusDict } from 'sfc-common/model/AsyncTaskRecord'
import { LoadingManager, MethodInterceptor, StringFormatter } from 'sfc-common/utils'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, onUnmounted } from 'vue'
import { FormGrid, LoadingMask, FormCol, FormRow } from 'sfc-common/components'
import UserAvatar from '../User/UserAvatar.vue'
import LogView from '../LogView.vue'
import CommonIcon from '../CommonIcon.vue'
import CodeEditor from '../Editor/CodeEditor.vue'
import { WebSocketService } from 'sfc-common/core/serivce/WebSocketService'

export default defineComponent({
  name: 'AsyncTaskInfo',
  components: { LoadingMask, FormGrid, FormCol, FormRow, LogView, UserAvatar, CommonIcon }
})
</script>

<style scoped lang="scss">

.status-text-1 {
  color: rgb(var(--v-theme-primary));
}
.status-text-2 {
  color: rgb(var(--v-theme-success));
}
.status-text-3 {
  color: rgb(var(--v-theme-error));
}

.status-text-4 {
  color: rgb(var(--v-theme-warning));
}
</style>