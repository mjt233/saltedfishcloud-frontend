<template>
  <ResizeContainer>
    <CodeEditor
      type="markdown"
      :model-value="modelValue"
      v-bind="$attrs"
      @update:model-value="modelValueChange"
    />
    <template #resizeable>
      <MarkdownView :content="curMarkdownText" />
    </template>
  </ResizeContainer>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})
const emits = defineEmits(['update:modelValue'])
const curMarkdownText = ref('')

const updateMarkdownText = MethodInterceptor.createThrottleProxy(
  MethodInterceptor.wrapFun((value: string) => { curMarkdownText.value = value}),
  { afterExecute: true }
)

watch(() => props.modelValue, () => {
  updateMarkdownText.invoke(props.modelValue)
})
onMounted(() => {
  curMarkdownText.value = props.modelValue
})

const modelValueChange = (value: string) => {
  emits('update:modelValue', value)
  updateMarkdownText.invoke(value)
}
</script>

<script lang="ts">
import { MethodInterceptor } from '@/utils/MethodInterceptor'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, watch } from 'vue'

export default defineComponent({
  name: 'MarkdownEditor'
})
</script>