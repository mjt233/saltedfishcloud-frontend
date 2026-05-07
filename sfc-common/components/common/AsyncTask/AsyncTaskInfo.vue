<template>
  <div class="async-task-info">
    <LoadingMask :loading="loading || !taskRecord" :type="'circular'" />
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
            <div class="d-flex">
              <span :class="`status-text-${taskRecord.status}`">{{ AsyncTaskRecordStatusDict[taskRecord.status] }}</span>
              <div
                v-if="[0,1,5].includes(taskRecord.status)"
                v-ripple
                title="中断任务"
                class="d-flex justify-center align-center bg-error"
                style="width: 24px;height: 24px;cursor: pointer;border-radius: 50%;margin-left: 6px;"
                @click="interruptTask"
              >
                <CommonIcon style="font-size: 12px" icon="mdi-stop" />
              </div>
            </div>
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
            <div class="d-flex align-center">
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
              style="cursor: pointer;display: inline-block;"
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
        <VBtn v-if="!isShowLog" color="primary" @click="startLoadLog()">
          加载日志
        </VBtn>
        <LogView v-else :log-text="logText" style="height: 50vh;" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  taskId: {
    type: [Number, String] as PropType<IdType>,
    default: 0
  },
  /**
   * 是否默认自动加载日志
   */
  autoOpenLog: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits<AsyncTaskInfoEmits>()

// 是否已经触发了task-exit事件
let isEmitTaskExited = false
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()
const createUser = ref({}) as Ref<BaseUserInfo>

// 使用组合式函数获取任务信息
const taskRecord = useTaskRecord(props.taskId, {
  onTaskExit: (taskId) => {
    if (!isEmitTaskExited) {
      isEmitTaskExited = true
      emits('task-exit', taskRecord.value as AsyncTaskRecord)
    }
  },
  onLoaded(taskRecord) {
    if (!isShowLog.value && props.autoOpenLog) {
      console.log('自动加载日志')
      startLoadLog()
    }
    if (taskRecord && [2,3,4,5].includes(taskRecord.status)) {
      isEmitTaskExited = true
      emits('task-exit', taskRecord as AsyncTaskRecord)
    }
  },
})

// 使用组合式函数获取日志
const {
  logText,
  isShowLog,
  startLoadLogData: startLoadLog
} = useTaskLogText(props.taskId, {
  taskStatus: () => taskRecord.value?.status
})

const actions = MethodInterceptor.createAsyncActionProxy({
  async asyncInterruptTask() {
    return await SfcUtils.request(API.asyncTask.interrupt(taskRecord.value?.id || 0))
  }
}, false, loadingManager)

// 加载创建者用户信息
const loadUserInfo = async() => {
  if (!taskRecord.value) return
  const userResult = (await SfcUtils.request(API.user.findBaseInfoByIds([taskRecord.value.uid]))).data.data
  if (userResult?.length) {
    createUser.value = userResult[0]
  }
}

const interruptTask = () => {
  SfcUtils.confirm('确定要中断该任务执行吗？', '中断确认')
    .then(actions.asyncInterruptTask)
}

const formatJsonText = (json: string) => {
  return JSON.stringify(JSON.parse(json), null, 2)
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

watch(taskRecord, (newVal) => {
  if (newVal) {
    loadUserInfo()
  }
})

</script>

<script lang="ts">
import API from 'sfc-common/api'
import { BaseUserInfo, IdType } from 'sfc-common/model'
import { AsyncTaskRecord, AsyncTaskRecordStatusDict } from 'sfc-common/model/AsyncTaskRecord'
import { LoadingManager, MethodInterceptor, StringFormatter } from 'sfc-common/utils'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, watch } from 'vue'
import { FormGrid, LoadingMask, FormCol, FormRow } from 'sfc-common/components'
import UserAvatar from '../User/UserAvatar.vue'
import LogView from '../LogView.vue'
import CommonIcon from '../CommonIcon.vue'
import CodeEditor from '../Editor/CodeEditor.vue'
import { useTaskLogText } from './composables/useTaskLogText'
import { useTaskRecord } from './composables/useTaskRecord'
import { AsyncTaskInfoEmits } from './asyncTaskInfoDefine'

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
