<template>
  <v-progress-circular
    v-if="status == 'testing'"
    title="连通性测试中" 
    indeterminate
    color="primary"
  />
  <CommonIcon
    v-else-if="status == 'pass'"
    title="连通性测试成功"
    icon="mdi-check"
    color="success"
  />
  <CommonIcon
    v-else-if="status == 'failed'"
    title="连通性测试失败"
    icon="mdi-alert"
    color="warning"
  />
</template>

<script setup lang="ts">
const props = defineProps({
  status: {
    type: String as PropType<ProxyTestStatus>,
    default: 'waiting'
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { ProxyTestStatus } from './ProxyTester'

export default defineComponent({
  name: 'ProxyTestStatus'
})
</script>