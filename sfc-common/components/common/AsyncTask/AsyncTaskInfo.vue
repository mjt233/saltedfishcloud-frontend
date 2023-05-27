<template>
  <div class="async-task-info">
    <LoadingMask :loading="loading" :type="'circular'" />
    <div v-if="!taskRecord" style="height: 120px;">
      <p>加载中...</p>
    </div>
    <div v-else>
      <FormGrid row-height="64px">
        <FormRow>
          <FormCol top-label label="任务名">
            {{ taskRecord.name }}
          </FormCol>
          <FormCol top-label label="任务类型">
            {{ taskRecord.taskType }}
          </FormCol>
          <FormCol top-label label="执行主机">
            <span>{{ taskRecord.executor }}</span>
          </FormCol>
          <FormCol top-label label="任务状态">
            <span :class="`status-text-${taskRecord.status}`">{{ AsyncTaskRecordStatusDict[taskRecord.status] }}</span>
          </FormCol>
        </FormRow>
      </FormGrid>
      <VDivider style="margin: 6px 0 24px 0;" />
      <p class="tip">
        任务日志
      </p>
      <VBtn v-if="!isShowLog" color="primary" @click="actions.loadLog">
        查看详情
      </VBtn>
      <LogView v-else :log-text="logText" style="height: 60vh;" />
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

const actions = MethodInterceptor.createAsyncActionProxy({
  async loadData() {
    taskRecord.value = (await SfcUtils.request(API.asyncTask.getById(props.taskId))).data.data
  },
  async loadLog() {
    const dialog = SfcUtils.loadingDialog({ msg: '正在获取' })
    try {
      const logData = (await SfcUtils.request(API.asyncTask.getLog(props.taskId))).data.data
      if (logData) {
        logText.value = logData
      } else {
        logText.value = '无日志'
      }
      isShowLog.value = true
    } finally {
      dialog.close()
    }
  }
}, false, loadingManager)

onMounted(actions.loadData)

</script>

<script lang="ts">
import { API } from 'sfc-common/index'
import { IdType } from 'sfc-common/model'
import { AsyncTaskRecord, AsyncTaskRecordStatusDict } from 'sfc-common/model/AsyncTaskRecord'
import { LoadingManager, MethodInterceptor } from 'sfc-common/utils'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'
import { FormGrid, LoadingMask, FormCol, FormRow } from 'sfc-common/components'
import LogView from '../LogView.vue'

export default defineComponent({
  name: 'AsyncTaskInfo',
  components: { LoadingMask, FormGrid, FormCol, FormRow, LogView }
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