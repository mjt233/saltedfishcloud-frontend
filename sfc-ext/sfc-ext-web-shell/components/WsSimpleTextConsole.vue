<template>
  <div class="simple-text-console">
    <SimpleTextarea
      ref="outputRef" 
      :model-value="output"
      :style="{height: showInput ? 'calc(100% - 64px)' : '100%'}"
      readonly
    />
    <TextInput
      v-if="showInput"
      v-model="input"
      label="命令"
      @keypress.enter="emits('input', input);input = ''"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  output: {
    type: String,
    default: ''
  },
  showInput: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits<{
  (e: 'input', v: string): void
}>()
const input = ref('')
const outputRef = ref() as Ref<ComponentPublicInstance>

const scrollToBottom = async() => {
  await nextTick()
  const outputDOM = outputRef.value.$el as HTMLElement
  outputDOM.scrollTop = outputDOM.scrollHeight
}
watch(() => props.output, scrollToBottom)
onMounted(scrollToBottom)
</script>

<script lang="ts">
import { ComponentPublicInstance } from 'vue'
import { nextTick } from 'vue'
import { onMounted } from 'vue'
import { watch } from 'vue'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'WsSimpleTextConsole'
})
</script>

<style scoped lang="scss">
.simple-text-console {
  font-family: Menlo,Monaco,Consolas,'Courier New',monospace;
  border-radius: 0;
  height: 100%;
}
</style>