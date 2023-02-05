<template>
  <div>
    <v-tabs
      v-model="tab"
      color="primary"
      fixed-tabs
    >
      <v-tab value="1">
        进行中<span>({{ runningCount }})</span>
      </v-tab>
      <v-tab value="2">
        已完成<span v-if="finishCount">({{ finishCount }})</span>
      </v-tab>
      <v-tab value="3">
        执行失败<span v-if="failedCount">({{ failedCount }})</span>
      </v-tab>
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item value="1">
        <EncodeConvertTaskInfo v-for="item in runningTasks" :key="item.id" :task="item" />
        <EmptyTip v-if="!runningTasks.length" />
      </v-window-item>

      <v-window-item value="2">
        <EncodeConvertTaskInfo
          v-for="item in finishTasks"
          :key="item.id"
          :task="item"
          :have-log="true"
        />
        <EmptyTip v-if="!finishTasks.length" />
      </v-window-item>
      <v-window-item value="3">
        <EncodeConvertTaskInfo
          v-for="item in failedTasks"
          :key="item.id"
          :task="item"
          :have-log="true"
        />
        <EmptyTip v-if="!failedTasks.length" />
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
const tab = ref('1')
const props = defineProps({
  uid: {
    type: [String, Number],
    default: 0
  }
})
const runningCount = ref(0)
const runningTasks = ref<EncodeConvertTask[]>([])
const finishTasks = ref<EncodeConvertTask[]>([])
const finishCount = ref(0)
const failedTasks = ref<EncodeConvertTask[]>([])
const failedCount = ref(0)
const loadTask = async(status: number) => {
  const res = (await window.SfcUtils.request(VEAPI.listConvertTask(props.uid, status, 0, 20))).data.data
  return res
}
const loadRunning = async() => {
  const runningPromise = loadTask(1)
  const waitingPromise = loadTask(0)
  const res = await Promise.all([runningPromise, waitingPromise])
  runningCount.value = Number(res[0].totalCount) || 0
  runningTasks.value = res[0].content
  runningCount.value += Number(res[1].totalCount)
  runningTasks.value = runningTasks.value.concat(res[1].content)
}
const loadFinish = async() => {
  const res = await loadTask(2)
  finishCount.value = res.totalCount
  finishTasks.value = res.content
}
const loadFailed = async() => {
  const res = await loadTask(3)
  failedCount.value = res.totalCount
  failedTasks.value = res.content
}
let autoLoadTimer: any
let autoLoading = false

onMounted(() => {
  loadFinish()
  loadRunning()
  loadFailed()
  autoLoadTimer = setInterval(async() => {
    if (autoLoading) {
      return
    }
    try {
      autoLoading = true
      let promise
      if (tab.value == '1') {
        promise = loadRunning()
      } else if (tab.value == '2') {
        promise = loadFinish()
      } else {
        promise = loadFailed()
      }
      await promise
    } finally {
      autoLoading = false
    }

  }, 2500)
})

onUnmounted(() => {
  if (autoLoadTimer) {
    clearInterval(autoLoadTimer)
  }
})

</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, onUnmounted } from 'vue'
import { VEAPI } from '../api'
import { EncodeConvertTask } from '../model'
import EncodeConvertTaskInfo from './EncodeConvertTaskInfo.vue'

export default defineComponent({
  name: 'EncodeConvertTask',
  components: { EncodeConvertTaskInfo }
})
</script>