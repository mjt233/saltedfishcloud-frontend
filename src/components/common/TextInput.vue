<template>
  <v-text-field
    :variant="props.variant"
    :rules="props.rules"
    :type="props.type"
    :error-messages="errorMessage"
    :model-value="value"
    :label="label"
    :color="color"
    :error="error"
    @input="input"
    @keyup.enter="test"
    @blur="validate"
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
const error = ref(false)
const errorMessage = ref('')
const emit = defineEmits(['update:value', 'enter'])
const test = () => {
  console.log('enter')
  emit('enter')
}
let curVal = ''

const validate = async():Promise<ValidateResult> => {
  const res:ValidateResult = {
    valid: true,
    errorMessages: []
  }
  try {
    if (props.rules && props.rules.length != 0) {
      for(const rule of props.rules) {
        const ret = await (rule as Function)(curVal)
        if (ret !== true) {
          res.valid = false,
          res.errorMessages.push({ id: 1, errorMessages: ret })
        }
      }
    }
  } catch(err: any) {
    res.valid = false,
    res.errorMessages.push({ id: 1, errorMessages: err.toString() })
  }

  if (!res.valid) {
    error.value = true
    errorMessage.value = res.errorMessages[0].errorMessages
  } else {
    error.value = false
    errorMessage.value = ''
  }
  return res
}
const input = (e: any) => {
  curVal = e.target.value
  validate()
  emit('update:value', e.target.value)
}
defineExpose({
  validate
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineExpose, ref, toRefs, toRef } from 'vue'
import { context, ValidateResult } from '@/core/context'

export default defineComponent({
  name: 'TextInput'
})
</script>