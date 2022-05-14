<template>
  <v-text-field
    :variant="variant"
    :rules="props.rules"
    :type="type"
    :model-value="value"
    :label="label"
    :color="color"
    @input="input"
    @keyup.enter="test"
  />
</template>

<script setup lang="ts">
const userInfo = context.session.value.user
const props = defineProps({
  rules: {
    type: Array,
    default: null
  },
  value: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'underlined'
  },
  color: {
    type: String,
    default: 'primary'
  }
})
const emit = defineEmits(['update:value', 'enter'])

const input = (e: Event) => {
  emit('update:value', (e.target as any).data)
}
const test = () => {
  console.log('enter')
  emit('enter')
}
</script>

<script lang="ts">
import { defineComponent, defineProps } from 'vue'
import { context } from '@/core/context'

export default defineComponent({
  name: 'TextInput'
})
</script>