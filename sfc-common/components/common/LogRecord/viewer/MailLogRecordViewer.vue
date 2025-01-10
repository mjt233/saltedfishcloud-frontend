<template>
  <div>
    <a class="link" @click="showDetail">查看明细</a>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  logRecord: {
    type: Object as PropType<LogRecord>,
    default: undefined
  }
})

function showDetail() {
  SfcUtils.openComponentDialog(MailLogRecordDetail, {
    props: {
      logRecord: props.logRecord
    },
    title: '发送邮件明细',
    showCancel: false,
    extraDialogOptions: {
      maxWidth: '860px'
    }
  })
}
</script>

<script lang="ts">
import { LogRecord } from 'sfc-common/model/LogRecord'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, h, computed } from 'vue'
import MailLogRecordDetail from './MailLogRecordDetail.vue'


export default defineComponent({
  name: 'MailLogRecordViewer'
})
</script>