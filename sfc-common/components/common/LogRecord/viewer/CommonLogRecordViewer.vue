<template>
  <div>
    <a v-if="logRecord.msgDetail" class="link" @click="openDetail">查看明细</a>
    <span v-else> - </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  logRecord: {
    type: Object as PropType<LogRecord>,
    default: undefined
  }
})

const jsonDetailObj = computed(() => {
  try {
    return JSON.parse(props.logRecord?.msgDetail as string)
  } catch (err) {
    return null
  }
})

function openDetail() {
  SfcUtils.openComponentDialog(CodeEditor, {
    props: {
      languages: jsonDetailObj.value && 'json' || undefined,
      modelValue: jsonDetailObj.value ? JSON.stringify(jsonDetailObj.value, null, 2) : props.logRecord?.msgDetail,
      style: {
        height: '100%'
      }
    },
    fullscreen: true,
    title: `${props.logRecord?.type}日志明细`,
    showCancel: false
  })
}
</script>

<script lang="ts">
import { LogRecord } from 'sfc-common/model/LogRecord'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed } from 'vue'
import CodeEditor from '../../Editor/CodeEditor.vue'

export default defineComponent({
  name: 'CommonLogRecordViewer'
})
</script>