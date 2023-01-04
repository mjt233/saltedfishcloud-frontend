<template>
  <div class="text-h6">
    {{ hello }}，现在是{{ nowDate }}
  </div>
  <div v-if="message" class="tip">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  message: {
    type: String,
    default: undefined
  },
  desktopComponentConfig: {
    type: Object as PropType<DesktopComponentConfig>,
    default: undefined
  }
})
const hello = ref('')
const nowDate = ref('')
const paddingZero = (num: number) => {
  return num < 10 ? '0' + num : num
}
const update = () => {
  const now = new Date
  const hours = now.getHours()
  if (hours >= 4 && hours <= 9) {
    hello.value = '早上好'
  } else if (hours > 9 && hours <= 12) {
    hello.value = '上午好'
  } else if (hours >= 12 && hours <= 13) {
    hello.value = '中午好'
  } else if (hours >= 14 && hours < 18) {
    hello.value = '下午好'
  } else if (hours >= 18 || hours < 4 ) {
    hello.value = '晚上好'
  }
  nowDate.value = `${paddingZero(now.getHours())}:${paddingZero(now.getMinutes())}`
}
let intv: any
onMounted(() => {
  update()
  intv = setInterval(update, 1000)
})
onUnmounted(() => {
  clearInterval(intv)
})
</script>

<script lang="ts">
import { DesktopComponentConfig } from '@/core/model/Desktop'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, h, onMounted, onUnmounted } from 'vue'

export default defineComponent({
  name: 'DateTip'
})
</script>