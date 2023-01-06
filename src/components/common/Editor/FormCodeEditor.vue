<template>
  <div>
    <span class="tip">{{ node?.title }}</span>
    <CodeEditor v-bind="$attrs" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  node: {
    type: Object as PropType<ConfigNodeModel>,
    default: undefined
  }
})
</script>

<script lang="ts">
import { ConfigNodeModel } from '@/core/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'FormCodeEditor'
})
</script>