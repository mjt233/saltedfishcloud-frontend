<template>
  <VCard>
    <VCardText>
      <FormSelect
        v-model="selectedLevel"
        style="width: 210px;display: inline-block;margin-right: 12px;"
        placeholder="日志级别"
        multiple
        multiple-show-num="1"
        use-chip
        :items="[
          {title: 'ERROR', value: 'ERROR'},
          {title: 'WARN', value: 'WARN'},
          {title: 'INFO', value: 'INFO'},
          {title: 'DEBUG', value: 'DEBUG'},
          {title: 'TRACE', value: 'TRACE'}
        ]"
      />
      <FormSelect
        v-model="selectedType"
        style="width: 210px;display: inline-block;"
        placeholder="日志类型"
        multiple
        use-chip
        :items="statisticItems"
        :multiple-show-num="1"
      />
      <VDataTableServer
        :headers="headers"
        :items="recordList"
        :loading="loading"
        density="compact"
        item-key="id"
        :fixed-header="true"
        :fixed-footer="true"
        :items-per-page="20"
        hover
        color="primary"
        :mobile="null"
        mobile-breakpoint="md"
        :items-length="totalLen"
        :items-per-page-options="[
          {value: 10, title: '10'},
          {value: 20, title: '20'},
          {value: 50, title: '50'},
          {value: 100, title: '100'}
        ]"
        items-per-page-text="每页大小"
        @update:options="loadItem"
      >
        <template #item.createAt="scope">
          {{ formatDate(scope.value) }}
        </template>
        <template #item.level="scope">
          <span :class="'text-' + levelColorMap[scope.item.level]">
            {{ scope.value }}
          </span>
        </template>
        <template #item.msgAbstract="scope">
          <span class="break-text">{{ scope.value }}</span>
        </template>
        <template #item.msgDetail="scope">
          <component :is="logViewerMap[scope.item.type] || 'commonLogRecordViewer'" :log-record="scope.item" :text="scope.item.msgDetail" />
        </template>
      </VDataTableServer>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
const props = defineProps({})
const lm = new LoadingManager()
const loading = lm.getLoadingRef()
const recordList = ref<LogRecord[]>([])
const headers = [
  { title: '时间', key: 'createAt', sortable: false, width: '210px'},
  { title: '类型', key: 'type', sortable: false, minWidth: '108px' },
  { title: '级别', key: 'level', sortable: false, width: '81px' },
  { title: '摘要', key: 'msgAbstract', sortable: false },
  { title: '明细', key: 'msgDetail', sortable: false, minWidth: '120px' }
]
const pageRequest = reactive({ page: 0, size: 20 } as PageableRequest)
const totalLen = ref(0)
const logViewerMap = LogRecordService.getLogViewerMap()
const actions = MethodInterceptor.createAsyncActionProxy({
  async loadList() {
    const res = (await SfcUtils.request(API.admin.logRecord.queryLog({
      level: selectedLevel.value,
      type: selectedType.value,
      pageableRequest: pageRequest
    }))).data.data
    recordList.value = res.content
    totalLen.value = res.totalCount
  },
  async loadStatistic() {
    statisticItems.value = (await SfcUtils.request(API.admin.logRecord.queryLogStatistic())).data.data.map(e => {
      return {
        title: `${e.type}(${e.count})`,
        value: e.type
      }
    })
  }
}, true, lm)

const selectedLevel = ref([] as LogLevel[])
const statisticItems = ref([] as SelectOption[])
const selectedType = ref([])
async function loadItem(param: {page: number, itemsPerPage: number}) {
  pageRequest.size = param.itemsPerPage
  pageRequest.page = param.page - 1
  await actions.loadList()
  await actions.loadStatistic()
}
const levelColorMap = {
  'ERROR': 'error',
  'INFO': 'success',
  'WARN': 'warning',
  'TRACE': 'info',
  'DEBUG': 'info',
}
onMounted(() => {
  actions.loadList()
  actions.loadStatistic()
})
watch(selectedLevel, (n,o) => {
  console.info({
    n,o
  })
  pageRequest.page = 0
  actions.loadList()
})
watch(selectedType, () => {
  pageRequest.page = 0
  actions.loadList()
})
function formatDate(date: Date) {
  return StringFormatter.toDate(date, true)
}
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, reactive, watch } from 'vue'
import LoadingMask from '../LoadingMask.vue'
import { LoadingManager, MethodInterceptor, StringFormatter } from 'sfc-common/utils'
import { LogLevel, LogRecord, LogRecordStatisticVO } from 'sfc-common/model/LogRecord'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import API from 'sfc-common/api'
import { LogRecordService } from 'sfc-common/core/serivce/LogRecordService'
import { PageableRequest, SelectOption } from 'sfc-common/model'
import { VCardText } from 'vuetify/components'
import FormSelect from '../FormSelect.vue'

export default defineComponent({
  name: 'LogRecordHistoryViewer'
})
</script>