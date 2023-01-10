<template>
  <div class="debug-console">
    <p v-for="(msg, idx) in messages" :key="msg.message + idx">
      {{ msg.message }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  active: {
    type: Boolean,
    default: false
  }
})
// 备份console.log
const originLog = console.log

// 切换/还原console.log方法
const switchLogMethod = () => {
  if (props.active) {
    console.log = (msg, opt) => {
      addMessage({type: 'info', message: msg})
      originLog.apply(console, [msg, opt])
    }
  } else {
    console.log = originLog
  }
}
watch(() => props.active, switchLogMethod)

// 采集到的消息
const messages = ref<Message[]>([])
const addMessage = (msg: Message) => {
  messages.value.unshift(msg)
}

defineExpose({ addMessage })
onMounted(switchLogMethod)
onUnmounted(() => {
  console.log = originLog
})
</script>

<script lang="ts">
interface Message {
  type: 'info' | 'warning' | 'error' | 'debug',
  message: string
}
import SfcUtils from '@/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, watch, onUnmounted } from 'vue'

export default defineComponent({
  name: 'DebugConsole'
})
</script>

<style scoped lang="scss">
.debug-console {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 640px;
  height: 120px;
  z-index: 666666;
  background-color: rgb(39, 39, 39);
  color: white;
}
</style>