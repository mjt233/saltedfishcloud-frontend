<template>
  <div ref="thisRef">
    <div v-if="showName" class="d-flex align-center gap-1">
      <VIcon
        v-if="[2,3].includes(taskRecord?.status || 0)"
        :color="taskRecord?.status === 2 ? 'success' : 'error'"
        size="small"
        :icon="taskRecord?.status === 2 ? 'mdi-check-circle' : 'mdi-close-circle'"
        class="mt-1"
      />
      <span>任务名称：{{ taskRecord?.name }}</span>
    </div>
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
        height="20"
      >
        <span class="tip" :style="{ color: (((prog?.record.loaded ?? 0) / prog.record.total) * 100) > 50 ? 'rgb(var(--v-theme-on-primary))' : '' }">
          {{ (((prog?.record.loaded ?? 0) / prog.record.total) * 100).toFixed(1) }}%
        </span>
      </VProgressLinear>
    </div>
    <div v-if="showSpeed" class="tip mt-1 mb-2 d-flex align-center gap-2 flex-wrap">
      <span v-if="showSpeed && prog?.record.speed && prog?.record.speed > 0" class="mr-3">
        速度：{{ speedFormatter((prog?.record.speed ?? 0)) }}
      </span>
      <span v-if="showSpeed && avgSpeed > 0">
        平均速度：{{ speedFormatter(Number(avgSpeed.toFixed(2))) }}
      </span>
    </div>
    <VBtn
      variant="text"
      @click="logVisible = !logVisible"
    >
      {{ logVisible ? '隐藏明细' : '显示明细' }}
    </VBtn>
    <div v-show="logVisible" class="log-view-container rounded" :style="{height: logHeight + 'px', border: '1px solid rgb(var(--v-border-color))' }">
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
   * 是否显示进度百分比
   */
  showProgressPercent: {
    type: Boolean,
    default: true
  },
  /**
   * 是否显示速度（包含当前速度和平均速度）
   */
  showSpeed: {
    type: Boolean,
    default: true
  },
  /**
   * 速度格式化函数，参数为每秒完成的量
   */
  speedFormatter: {
    type: Function as PropType<(speed: number) => string>,
    default: (speed: number) => speed + '/s'
  },
  /**
   * 组件可容纳的总高度，用于计算日志显示高度。未传入则使用页面高度。
   */
  height: {
    type: Number,
    default: undefined
  },
  /**
   * 日志是否默认折叠
   */
  logCollapsed: {
    type: Boolean,
    default: true
  }
})

// 日志是否可见
const logVisible = ref(!props.logCollapsed)
// 用于平均速度统计的初始进度值
let initialProgLoaded = 0
// 组件挂载时间
let mountTime = 0
// 平均速度
const avgSpeed = ref(0)

function updateAvgSpeed() {
  if (!prog.value || !mountTime) return
  const currentLoaded = prog.value.record.loaded ?? 0
  const elapsedSeconds = (Date.now() - mountTime) / 1000
  if (elapsedSeconds > 0) {
    avgSpeed.value = (currentLoaded - initialProgLoaded) / elapsedSeconds
  }
}

const { prog, startUpdateProgress, stopUpdateProgress } = useTaskProg({
  taskId: props.taskId,
  onUpdate() {
    if (!mountTime) {
      mountTime = Date.now()
    }
    if (!initialProgLoaded && prog.value) {
      initialProgLoaded = prog.value.record.loaded ?? 0
    }
    updateAvgSpeed()
  }
})

const taskRecord = useTaskRecord(props.taskId, {
  onLoaded(taskRecord) {
    if (taskRecord) {
      startUpdateProgress()
      // 只有当日志可见时才加载日志
      if (logVisible.value && !isShowLog.value) {
        startLoadLogData()
      }
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
    stopUpdateProgress()
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
const { logText, isShowLog, startLoadLogData, clear: clearLog } = useTaskLogText(props.taskId, {
  taskStatus() {
    return taskRecord.value?.status
  },
})

// 监听日志显示状态，切换到显示时加载日志，隐藏时停止加载
watch(logVisible, (newVal) => {
  if (newVal && !isShowLog.value && taskRecord.value) {
    startLoadLogData()
  } else if (!newVal && isShowLog.value) {
    clearLog()
  }
})
</script>

<script lang="ts">
import { IdType } from 'sfc-common/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, watch } from 'vue'
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