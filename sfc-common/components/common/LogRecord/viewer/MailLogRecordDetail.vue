<template>
  <div>
    <div>
      <VSwitch v-model="renderContent" color="primary" label="渲染正文" />
    </div>
    <VAlert
      v-if="!detailObj.isSuccess"
      type="error"
      title="该邮件无法发出"
      variant="tonal"
      :text="'原因: ' + detailObj.error"
      elevation="2"
    />
    <VAlert
      v-else
      type="success"
      variant="tonal"
      text="该邮件已发出"
      elevation="2"
    />
    <VCard v-for="(content,idx) in contentList" :key="idx" class="mt-3">
      <VCardText>
        <template v-if="renderContent">
          <div :innerText="content.substring(0, content.indexOf(beginFlag))" />
          <div :innerHTML="content.substring(content.indexOf(beginFlag) + beginFlag.length, content.length - endFlag.length - 1)" />
        </template>
        <div v-else :innerText="content" />
      </VCardText>
    </VCard>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  logRecord: {
    type: Object as PropType<LogRecord>,
    default: undefined
  }
})
const beginFlag = '====content begin==='
const endFlag = '====content end==='
const renderContent = ref<boolean>(true)
const detailObj = computed(() =>JSON.parse(props.logRecord?.msgDetail as string))
const contentList = computed(() => detailObj.value.content as string[])
</script>

<script lang="ts">
import { LogRecord } from 'sfc-common/model/LogRecord'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed } from 'vue'

export default defineComponent({
  name: 'MailLogRecordDetail'
})
</script>