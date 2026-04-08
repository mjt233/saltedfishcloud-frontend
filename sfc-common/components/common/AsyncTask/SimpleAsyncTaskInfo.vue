<template>
  <div ref="thisRef">
    <span v-if="showName">任务名称：{{ taskRecord?.name }}</span>
    <div v-if="showProgress" class="mt-1 mb-2">
      <VProgressCircular
        v-if="!prog || prog.record.total <= 0"
        color="primary"
        :indeterminate="true"
      />
      <VProgressLinear
        v-else
        :model-value="prog?.record.loaded"
        :max="prog?.record.total"
        color="primary"
      />
    </div>
    <div class="log-view-container" :style="{height: logHeight + 'px'}">
      <LogView
        v-if="taskRecord"
        :log-text="logText"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const thisRef = ref<HTMLElement | null>(null)
const emits = defineEmits<AsyncTaskInfoEmits>()
const props = defineProps({
  taskId: {
    type: [Number, String] as PropType<IdType>,
    default: 0
  },
  /**
   * 是否显示任务名称
   */
  showName: {
    type: Boolean,
    default: true
  },
  /**
   * 是否显示进度
   */
  showProgress: {
    type: Boolean,
    default: true
  },
  /**
   * 组件可容纳的总高度，用于计算日志显示高度。未传入则使用页面高度。
   */
  height: {
    type: Number,
    default: undefined
  }
})

const prog = useTaskProg({
  taskId: props.taskId
})
const taskRecord = useTaskRecord(props.taskId, {
  onLoaded(taskRecord) {
    if (!isShowLog.value && taskRecord) {
      startLoadLogData()
    } else {
      console.log('获取不到任务')
    }
  },
  onTaskExit() {
    if (taskRecord.value?.status == 2 && prog.value) {
      // 任务完成，直接标记任务进度满
      prog.value.record.loaded = prog.value.record.total
    }
    emits('task-exit', taskRecord.value as AsyncTaskRecord)
  }
})
const isMobile = useCheckIsMobile()
const { targetHeight: logHeight } = useAutoComputeHeight({
  autoComputeHeight: true,
  observeTarget: () => thisRef.value as HTMLElement,
  computeTarget: () => thisRef.value?.querySelector('.log-view-container') as HTMLElement,
  offset: 0,
  documentHeight: () => {
    return props.height || (isMobile.value ? (window.innerHeight - 80) : window.innerHeight - 320)
  }
})
const { logText, isShowLog, startLoadLogData } = useTaskLogText(props.taskId, {
  taskStatus() {
    return taskRecord.value?.status
  },
})
</script>

<script lang="ts">
import { IdType } from 'sfc-common/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { useTaskProg } from './composables/useTaskProg'
import { useTaskRecord } from './composables/useTaskRecord'
import LogView from '../LogView.vue'
import { useTaskLogText } from './composables/useTaskLogText'
import { useAutoComputeHeight } from '../FileExplorer/FileExplorerCore'
import { useCheckIsMobile } from 'sfc-common/composables/useCheckIsMobile'
import { AsyncTaskInfoEmits } from './asyncTaskInfoDefine'
import { AsyncTaskRecord } from 'sfc-common/model/AsyncTaskRecord'

export default defineComponent({
  name: 'SimpleAsyncTaskInfo'
})
</script>