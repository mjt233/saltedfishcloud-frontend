<template>
  <v-btn :disabled="!available" :color="color" @click="emit('click', startWait)">
    <template v-if="available">
      <slot />
    </template>
    <template v-else>
      {{ waitTime }}s
    </template>
  </v-btn>
</template>

<script setup lang="ts">
const props = defineProps({
  uniqueKey: {
    type: String,
    default: ''
  },
  timeout: {
    type: Number,
    default: 60
  },
  color: {
    type: String,
    default: 'primary'
  }
})
const emit = defineEmits(['click'])
let itv: any
const waitTime = ref(0)
const available = computed(() => {
  return waitTime.value <= 0
})

const getLastRecord = () => {
  return parseInt(localStorage.getItem('timeout_' + props.uniqueKey) || '-1')
}

// 更新可用与需等待时间状态
const updateStatus = () => {
  const lastRecord = getLastRecord()
  const enableRecord = lastRecord + props.timeout * 1000

  // 小于等于0说明未记录过
  if (lastRecord <= 0) {
    waitTime.value = 0
  } else {
    waitTime.value = Math.round((enableRecord - (new Date).getTime())/1000)
  }

  if (available.value) {
    localStorage.removeItem('timeout_' + props.uniqueKey)
  }
}

// 开始执行等待
const startWait = () => {

  // 只有当前可用时才更新
  if (available.value) {
    localStorage.setItem('timeout_' + props.uniqueKey, (new Date).getTime() + '')
  }
  updateStatus()
  if (itv) {
    return
  }
  itv = setInterval(() => {
    updateStatus()
    if (available.value) {
      itv && clearInterval(itv)
      itv = null
    }
  }, 1000)
}
defineExpose({
  startWait
})



onUnmounted(() => {
  itv && clearInterval(itv)
})


updateStatus()
if (!available.value) {
  startWait()
}
</script>

<script lang="ts">
import { defineComponent, defineProps, onUnmounted, ref } from 'vue'
import { context } from 'sfc-common/core/context'
import { computed } from '@vue/reactivity'

export default defineComponent({
  name: 'TimeoutBtn'
})
</script>