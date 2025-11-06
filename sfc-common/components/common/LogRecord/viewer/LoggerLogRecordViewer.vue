<template>
  <div>
    <a v-if="logRecord.level == 'ERROR' || logRecord.msgDetail.indexOf('\n') != -1" class="link" @click="showDetail">查看明细</a>
    <a v-else>-</a>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  logRecord: {
    type: Object as PropType<LogRecord>,
    default: undefined
  }
})

const hidLibStack = ref<boolean>(true)
const detailText = computed(() => {
  if (hidLibStack.value) {
    return props.logRecord?.msgDetail
      .split('\n')
      .filter(line => !line.startsWith('\tat org') && !line.startsWith('\tat java') &&  !line.startsWith('\tat jakarta'))
      .join('\n')
  } else {
    return props.logRecord?.msgDetail
  }
})

function showDetail() {
  SfcUtils.dialog({
    children: () => [
      h(VSwitch,{ color: 'primary', label: '隐藏库调用堆栈', 'onUpdate:modelValue': val => hidLibStack.value = val as boolean, modelValue: hidLibStack.value }),
      h(
        'pre',
        {
          style: {
            'line-height': '16px',
            'font-size': '14px'
          }
        },
        [ h('code', {innerText: detailText.value }, []) ]
      )
    ],
    onCancel: () => true,
    onConfirm: () => true,
    title: 'Logger明细',
    fullscreen: true
  })
  // SfcUtils.openComponentDialog(CodeEditor, {
  //   props: {
  //     modelValue: props.logRecord?.msgDetail,
  //     style: {
  //       height: '100%'
  //     },
  //     language: 'plaintext'
  //   },
  //   title: 'Logger明细',
  //   fullscreen: true,
  //   showCancel: false
  // })
}
</script>

<script lang="ts">
import { CodeEditor } from 'sfc-common/components'
import { LogRecord } from 'sfc-common/model/LogRecord'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, h, computed } from 'vue'
import { VCheckbox, VSwitch } from 'vuetify/components'


export default defineComponent({
  name: 'LoggerLogRecordViewer'
})
</script>