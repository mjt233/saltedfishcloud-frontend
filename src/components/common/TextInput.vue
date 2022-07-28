<template>
  <v-text-field
    ref="inputRef"
    class="text-input"
    :variant="variant"
    :rules="rules"
    :type="type"
    :error-messages="errorMessage"
    :model-value="modelValue"
    :label="label"
    :color="color"
    :error="error"
    :autofocus="autofocus"
    :hide-details="hideDetails"
    :disabled="disabled"
    :readonly="readonly"
    @input="input"
    @keyup.enter="doEnter"
    @blur="validate"
  />
</template>

<script setup lang="ts">
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  hideDetails: {
    type: Boolean,
    default: false
  },
  rules: {
    type: Array as PropType<ValidateRule[]>,
    default: () => []
  },
  modelValue: {
    type: [String, Number],
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
    type: String as PropType<'filled' | 'outlined' | 'plain' | 'underlined' | 'solo'>,
    default: 'underlined'
  },
  color: {
    type: String,
    default: 'primary'
  },
  autofocus: {
    type: Boolean,
    default: false
  }
})
const inputRef = ref()
const error = ref(false)
const errorMessage = ref('')
const emit = defineEmits(['update:modelValue', 'enter'])
const doEnter = () => {
  emit('enter')
}

const validate = async():Promise<ValidateResult> => {
  const res:ValidateResult = {
    valid: true,
    errors: []
  }
  try {
    if (props.rules && props.rules.length != 0) {
      for(const rule of props.rules) {
        const ret = await (rule as Function)(props.modelValue)
        if (ret !== true) {
          res.valid = false,
          res.errors.push({ id: 1, errorMessages: ret })
        }
      }
    }
  } catch(err: any) {
    res.valid = false,
    res.errors.push({ id: 1, errorMessages: err.toString() })
  }

  if (!res.valid) {
    error.value = true
    errorMessage.value = res.errors[0].errorMessages
  } else {
    error.value = false
    errorMessage.value = ''
  }
  return res
}
const input = (e: any) => {
  validate()
  emit('update:modelValue', e.target.value)
}
defineExpose({
  validate
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineExpose, ref, toRefs, toRef, PropType, onMounted, watch } from 'vue'
import { context, ValidateResult } from '@/core/context'
import { ValidateRule } from '@/core/model/component/type'

export default defineComponent({
  name: 'TextInput'
})
</script>