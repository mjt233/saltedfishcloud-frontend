<template>
  <div class="x-term">
    <div ref="dom" style="width: 100%; height: 100%;" />
  </div>
  
</template>

<script setup lang="ts">
const SfcUtils = window.SfcUtils
const dom = ref() as Ref<HTMLElement>
const props = defineProps({
  initOutput: {
    type: String,
    default: ''
  },
  sessionId: {
    type: [String, Number],
    default: undefined
  },
  initRows: {
    type: Number,
    default: 40
  },
  initCols: {
    type: Number,
    default: 160
  }
})
const terminal = new window.xterm.Terminal({
  cols: props.initCols,
  rows: props.initRows,
  fontFamily: 'Monaco,Consolas,\'Courier New\',monospace'
})
const emits = defineEmits<{
  (e: 'input', v: string, event: KeyboardEvent): void
}>()

const write = (text: string) => {
  terminal.write(text)
}

// 尺寸改变时，更新终端大小
let resizeLoading = false
const throttleActions = MethodInterceptor.createThrottleProxy({
  async doResize(sessionId: IdType, rows: number, cols: number) {
    if (resizeLoading) {
      return
    }
    resizeLoading = true
    try {
      await SfcUtils.request(WebShellApi.resizePty(sessionId, rows, cols))
      terminal.resize(cols, rows)
    } finally {
      resizeLoading = false
    }    
  }
}, { afterExecute: true })

const resizeHandler = () => {
  if (!props.sessionId) {
    return
  }
  const rows = Math.floor(dom.value.clientHeight / 18)
  const cols = Math.floor(dom.value.clientWidth / 7.4)
  if (terminal.rows != rows || terminal.cols != cols) {
    throttleActions.doResize(props.sessionId, rows, cols)
  }
  
}


onMounted(async() => {
  await nextTick()
  terminal.open(dom.value)
  terminal.write(props.initOutput)
  terminal.onKey(e => {
    emits('input', e.key, e.domEvent)
  })
  await SfcUtils.sleep(300)
  resizeHandler()
  window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeHandler)
})
defineExpose({
  write
})
</script>

<script lang="ts">
import { IdType, MethodInterceptor } from 'sfc-common'
import { nextTick } from 'vue'
import { onUnmounted } from 'vue'
import { onMounted } from 'vue'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { Terminal } from 'xterm'
import { WebShellApi } from '../api'

export default defineComponent({
  name: 'XTerminal'
})
</script>

<style scoped lang="scss">
.x-term {
  font-family: Menlo,Monaco,Consolas,'Courier New',monospace;
  position: relative;
  max-width: 100%;
  overflow: hidden;
  height: 100%;
}
</style>