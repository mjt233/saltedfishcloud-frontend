<template>
  <div ref="logContainer" class="log-view">
    <pre class="log-content">{{ logText }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  /**
   * 日志内容
   */
  logText: {
    type: String,
    default: ''
  }
})

// 日志容器引用
const logContainer = ref<HTMLElement | null>(null)

/**
 * 滚动到底部
 */
const scrollToBottom = () => {
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
}

// 监听日志内容变化，自动滚动到底部
watch(
  () => props.logText,
  async() => {
    // 等待DOM更新完成后滚动
    await nextTick()
    scrollToBottom()
  }
)
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LogView'
})
</script>

<style scoped lang="scss">
.log-view {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 12px;
  border-radius: 4px;
  box-sizing: border-box;

  .log-content {
    margin: 0;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}
</style>