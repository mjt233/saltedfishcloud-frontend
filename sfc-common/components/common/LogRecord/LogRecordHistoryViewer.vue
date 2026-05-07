<template>
  <VCard>
    <VCardText>
      <VRow>
        <VCol
          lg="3"
          md="6"
          sm="12"
        >
          <VTextField
            v-model="dateRange.begin"
            label="起始日期"
            type="date"
            color="primary"
            variant="underlined"
          />
        </VCol>
        <VCol
          lg="3"
          md="6"
          sm="12"
        >
          <VTextField
            v-model="dateRange.end"
            label="截止日期"
            type="date"
            color="primary"
            variant="underlined"
          />
        </VCol>
        <VCol
          lg="3"
          md="6"
          sm="12"
        >
          <VSelect
            v-model="selectedLevel"
            label="日志级别"
            multiple
            color="primary"
            variant="underlined"
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
        </VCol>
        <VCol
          lg="3"
          md="6"
          sm="12"
        >
          <VSelect
            v-model="selectedType"
            label="日志类型"
            multiple
            color="primary"
            variant="underlined"
            use-chip
            :items="statisticItems"
            :multiple-show-num="1"
          />
        </VCol>
      </VRow>
      <VDataTableServer
        :headers="headers"
        :items="recordList"
        :loading="loading"
        density="compact"
        item-key="id"
        :items-per-page="20"
        disable-sort
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
  { title: '时间', key: 'createAt', width: '210px'},
  { title: '类型', key: 'type', minWidth: '108px'},
  { title: '级别', key: 'level', width: '81px' },
  { title: '摘要', key: 'msgAbstract'},
  { title: '明细', key: 'msgDetail',  minWidth: '120px'}
]
const pageRequest = reactive({ page: 0, size: 20 } as PageableRequest)
const totalLen = ref(0)
const logViewerMap = LogRecordService.getLogViewerMap()
const tableOptions = ref(reactive({
  page: 1,
  itemsPerPage: 20,
  sortBy: []
}))
const dateRange = reactive({
  begin: StringFormatter.formatDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), 'yyyy-MM-dd'),
  end: StringFormatter.formatDate(new Date(), 'yyyy-MM-dd')
})

/**
 * 构建日志查询时间范围。
 * begin 固定为当天 00:00:00，end 固定为当天 23:59:59，确保截止日期当天日志可被完整查询。
 */
function buildQueryDateRange() {
  const begin = new Date(dateRange.begin)
  begin.setHours(0, 0, 0, 0)

  const end = new Date(dateRange.end)
  end.setHours(23, 59, 59, 999)

  return {
    begin,
    end
  }
}

const actions = MethodInterceptor.createAsyncActionProxy({
  async loadList() {
    const queryDateRange = buildQueryDateRange()
    const res = (await SfcUtils.request(API.admin.logRecord.queryLog({
      level: selectedLevel.value,
      type: selectedType.value,
      pageableRequest: pageRequest,
      dateRange: queryDateRange
    }))).data.data
    recordList.value = res.content
    totalLen.value = res.totalCount
  },
  async loadStatistic() {
    const queryDateRange = buildQueryDateRange()
    statisticItems.value = (await SfcUtils.request(API.admin.logRecord.queryLogStatistic({
      begin: queryDateRange.begin,
      end: queryDateRange.end
    }))).data.data.map(e => {
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

// 重置分页到第一页
function resetPagination() {
  tableOptions.value = {
    page: 1,
    itemsPerPage: 20,
    sortBy: []
  }
}

async function loadItem(param: {page: number, itemsPerPage: number, sortBy?: []}) {
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
  resetPagination()
  actions.loadList()
})
watch(selectedType, () => {
  resetPagination()
  actions.loadList()
})
watch(() => dateRange.begin, () => {
  resetPagination()
  actions.loadStatistic()
  actions.loadList()
})
watch(() => dateRange.end, () => {
  resetPagination()
  actions.loadStatistic()
  actions.loadList()
})
function formatDate(date: Date) {
  return StringFormatter.toDate(date, true)
}
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, reactive, watch, nextTick } from 'vue'
import { LoadingManager, MethodInterceptor, StringFormatter } from 'sfc-common/utils'
import { LogLevel, LogRecord, LogRecordStatisticVO } from 'sfc-common/model/LogRecord'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import API from 'sfc-common/api'
import { LogRecordService } from 'sfc-common/core/serivce/LogRecordService'
import { PageableRequest, SelectOption } from 'sfc-common/model'

export default defineComponent({
  name: 'LogRecordHistoryViewer'
})
</script>