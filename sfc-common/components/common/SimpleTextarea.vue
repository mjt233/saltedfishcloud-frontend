<template>
  <textarea class="simple-textarea" :value="modelValue" @input="input" />
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})
const emits = defineEmits(['update:modelValue', 'change'])
const input = (e: Event) => {
  emits('update:modelValue', (e.target as HTMLTextAreaElement).value)
  emits('change', (e.target as HTMLTextAreaElement).value)
}
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'SimpleTextarea'
})

</script>

<style lang="scss" scoped>

.simple-textarea {
  width: 100%;
  outline: none;
  min-height: 120px;
  border: 1px solid rgba(var(--v-theme-primary), .1);
  padding: 6px;
  border-radius: 3px;
  transition: all .1s;
  &:focus,&:hover {
    border: 1px solid rgba(var(--v-theme-primary), .4);
  }
}
</style>