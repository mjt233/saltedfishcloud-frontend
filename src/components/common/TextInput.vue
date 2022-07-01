<template>
  <v-text-field
    :variant="variant"
    :rules="rules"
    :type="type"
    :error-messages="errorMessage"
    :model-value="value"
    :label="label"
    :color="color"
    :error="error"
    :autofocus="autofocus"
    @input="input"
    @keyup.enter="doEnter"
    @blur="validate"
  />
</template>

<script setup lang="ts">
const props = defineProps({
  rules: {
    type: Array as PropType<ValidateRule[]>,
    default: () => []
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
const error = ref(false)
const errorMessage = ref('')
const emit = defineEmits(['update:value', 'enter'])
const doEnter = () => {
  emit('enter')
}
let curVal = ''

const validate = async():Promise<ValidateResult> => {
  const res:ValidateResult = {
    valid: true,
    errors: []
  }
  try {
    if (props.rules && props.rules.length != 0) {
      for(const rule of props.rules) {
        const ret = await (rule as Function)(curVal)
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
  curVal = e.target.value
  validate()
  emit('update:value', e.target.value)
}
defineExpose({
  validate
})
onMounted(() => {
  curVal = props.value
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineExpose, ref, toRefs, toRef, PropType, onMounted } from 'vue'
import { context, ValidateResult } from '@/core/context'
import { ValidateRule } from '@/core/model/component/type'

export default defineComponent({
  name: 'TextInput'
})
</script>