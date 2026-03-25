<template>
  <VTextField
    :model-value="modelValue"
    :placeholder="placeholder"
    clearable
    :color="color"
    hide-details
    @update:model-value="emits('update:modelValue', $event)"
    @keyup.enter="doSearch"
  >
    <template #append-inner>
      <v-icon icon="mdi-magnify" class="cursor-pointer" @click="doSearch" />
    </template>
  </VTextField>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: [String],
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: undefined
  }
})

const emits = defineEmits<{
  (e: 'update:modelValue', value?: string): void
  (e: 'search'): void
}>()

function doSearch() {
  emits('search')
}
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, mergeProps } from 'vue'

export default defineComponent({
  name: 'FileSearchInput'
})
</script>