<template>
  <div style="padding: 12px">
    <LoadingMask :loading="loading" />
    <VRow>
      <VCol>
        <VCard title="系统基础信息" style="height: 100%">
          <VCardContent>
            <VTable>
              <tbody>
                <tr>
                  <td style="width: 120px">
                    操作系统
                  </td>
                  <td style="min-width: 210px">
                    {{ curInfo?.os }}
                  </td>
                </tr>
                <tr>
                  <td>CPU型号</td>
                  <td>{{ curInfo?.cpu }}</td>
                </tr>
                <tr>
                  <td>核心数</td>
                  <td>{{ curInfo?.cpuPhysicalCount }}C {{ curInfo?.cpuLogicCount }}T</td>
                </tr>
                <tr>
                  <td>总内存</td>
                  <td>{{ StringFormatter.toSize(curInfo?.totalMemory || 0) }}</td>
                </tr>
              </tbody>
            </VTable>
          </VCardContent>
        </VCard>
      </VCol>
      <VCol>
        <VCard title="负载信息">
          <VCardContent>
            <div>
              <VRow>
                <VCol>
                  <VEChart class="chart-gauge" :option="chartsOption.curCpuLoad" />
                </VCol>
                <VCol>
                  <VEChart class="chart-gauge" :option="chartsOption.curMemoryLoad" />
                </VCol>
              </VRow>
              
            </div>
          </VCardContent>
        </VCard>
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        <VCard title="近期CPU与内存负载">
          <VCardContent>
            <div style="width: 100%;height: 280px;">
              <VEChart style="width: 100%;height: 100%;" :option="chartsOption.rangeCpuLoad" />
            </div>
          </VCardContent>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<script setup lang="ts">
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()

let stopAutoRefresh = false

const curInfo = ref({
  os: '加载中',
  cpuLoad: 0,
  cpu: '加载中',
  cpuLogicCount: 0,
  cpuPhysicalCount: 0,
  totalMemory: '0',
  usedMemory: '0',
  memoryUsedRate: '0'
} as SystemInfo)
const infoList = ref([]) as Ref<TimestampRecord<SystemInfo>[]>
const chartsOption = reactive({
  curCpuLoad: {},
  curMemoryLoad: {},
  rangeCpuLoad: {},
  rangeMemoryLoad: {} 
})

const actions = {
  async loadCurInfo() {
    curInfo.value = (await SfcUtils.request(API.admin.sys.getCurSystemInfo())).data.data
  },
  async loadInfoList() {
    infoList.value = (await SfcUtils.request(API.admin.sys.listSystemInfo())).data.data
  }
}

const getRangeChartOption = (series: {name: string, data: [number, number|string][]}[]):echarts.EChartsOption => {
  return {
    xAxis: {
      type: 'time',
      boundaryGap: false
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        animation: false
      }
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, '100%'],
      max: 100,
      min: 0
    },
    series: series.map(item => {
      return {
        name: item.name,
        type: 'line',
        areaStyle: {},
        data: item.data,
        showSymbol: false
      }
    })
  }
}

const getLoadChartOption = (name: string, value: string) => {
  return {
    tooltip: {
      formatter: '{b} : {c}%'
    },
    series: [
      {
        axisTick: {
          show: false
        },
        progress: {
          show: true,
          width: 6
        },
        axisLine: {
          lineStyle: {
            width: 6
          }
        },
        axisLabel: {
          distance: 10,
          color: '#999',
          fontSize: 9
        },
        anchor: {
          show: true,
          showAbove: true,
          size: 14,
          itemStyle: {
            borderWidth: 2
          }
        },
        name: name,
        type: 'gauge',
        detail: {
          formatter: '{value}%',
          offsetCenter: [0, '70%'],
          fontSize: 12,
        },
        title: {
          offsetCenter: [0, '100%'],
        },
        data: [
          {
            value: value,
            name: name
          }
        ]
      }
    ]}
}
/**
 * 刷新图表
 */
const updateChart = () => {
  chartsOption.curCpuLoad = getLoadChartOption('CPU负载', curInfo.value.cpuLoad.toFixed(0))
  chartsOption.curMemoryLoad = getLoadChartOption('内存负载', Number(curInfo.value.memoryUsedRate).toFixed(0))
  chartsOption.rangeCpuLoad = getRangeChartOption([{
    name: '内存负载',
    data: infoList.value.map(item => [Number(item.timestamp), item.data.memoryUsedRate])
  },{
    name: 'CPU负载',
    data: infoList.value.map(item => [Number(item.timestamp), item.data.cpuLoad.toFixed(0)])
  }])
  // chartsOption.rangeMemoryLoad = getRangeChartOption('内存负载', infoList.value.map(item => [Number(item.timestamp), item.data.memoryUsedRate]))
}
onMounted(async() => {
  loadingManager.beginLoading()
  try {
    await Promise.all([
      actions.loadCurInfo(),
      actions.loadInfoList()
    ])
    updateChart()

    const autoRefresh = async() => {
      if(stopAutoRefresh) {
        return
      }
      await Promise.all([
        actions.loadCurInfo(),
        actions.loadInfoList()
      ])
      updateChart()
      setTimeout(autoRefresh, 5000)
    }

    autoRefresh()

  } catch(err) {
    SfcUtils.snackbar(err)
  } finally {
    loadingManager.closeLoading()
  }
})

onUnmounted(() => {
  stopAutoRefresh = true
})
</script>

<script lang="ts">
import * as echarts from 'echarts'
import { LoadingManager, SfcUtils, API, SystemInfo, StringFormatter, TimestampRecord } from 'sfc-common'
import { VEChart } from 'sfc-common/components'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, onUnmounted, reactive } from 'vue'

export default defineComponent({
  name: 'MonitorView',
  components: { VEChart }
})
</script>


<style lang="scss" scoped>
.chart-gauge {
  height: 210px;
  min-width: 210px;
  max-width: 210px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>