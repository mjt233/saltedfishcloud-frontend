<template>
  <div ref="chartRef" />
</template>

<script setup lang="ts">
const props = defineProps({
  option: {
    type: Object as PropType<echarts.EChartsOption>,
    default() { return {} }
  }
})
const chartRef = ref() as Ref<HTMLElement>
let chartInst: echarts.ECharts

const initChart = () => {
  chartInst = echarts.init(chartRef.value)
}

const updateOption = () => {
  chartInst.setOption(props.option)
}

const resizeChart = MethodInterceptor.createThrottleProxy({
  resizeChart() {
    if (chartInst) {
      chartInst.resize()
    }
  }
}, {
  delay: 100,
  afterExecute: true
})

watch(() => props.option, () => {
  updateOption()
})

onMounted(() => {
  initChart()
  updateOption()
  window.addEventListener('resize', resizeChart.resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart.resizeChart)
  if (chartInst) {
    chartInst.dispose()
  }
})

</script>

<script lang="ts">
import * as echarts from 'echarts'
import { MethodInterceptor } from 'sfc-common/utils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, onUnmounted, watch } from 'vue'

export default defineComponent({
  name: 'VEChart'
})
</script>