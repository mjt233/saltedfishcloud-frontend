<template>
  <div class="logView">
    <CodeEditor
      style="height: 100%"
      read-only
      :model-value="logType == 'text' ? logText : logArr.join('\n')"
      :use-mini-map="false"
      :auto-to-scroll-bottom="true"
      hide-line-number
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  /**
   * 日志数组
   */
  logArr: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  /**
   * 日志全文
   */
  logText: {
    type: String,
    default: ''
  },
  /**
   * 日志数据源类型
   */
  logType: {
    type: String as PropType<'array' | 'text'>,
    default: 'text'
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { CodeEditor } from './Editor'

export default defineComponent({
  name: 'LogView',
  components: { CodeEditor }
})
</script>