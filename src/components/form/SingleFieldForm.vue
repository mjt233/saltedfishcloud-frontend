<template>
  <base-form ref="form" :model-value="modelValue" @update:model-value="emits('update:modelValue', $event)">
    <text-input
      ref="inputRef"
      :autofocus="autofocus"
      :label="label"
      :rules="rules"
      :value="modelValue.value"
      @enter="emits('enter')"
      @update:value="emits('update:modelValue', {value: $event});"
    />
  </base-form>
</template>

<script setup lang="ts">
import BaseForm from '../common/BaseForm.vue'
import TextInput from '../common/TextInput.vue'
import { ValidateRule } from '@/core/model/component/type'
const inputRef = ref() as Ref<ComponentPublicInstance>
const form = ref() as Ref<CommonForm>
const inputVal = ref()
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => {
      return { value: '' }
    }
  },
  label: {
    type: String,
    default: ''
  },
  rules: {
    type: Array as PropType<ValidateRule[]>,
    default: () => []
  },
  autofocus: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['update:modelValue', 'enter'])
defineExpose(deconstructForm(form))
onMounted(() => {
  inputVal.value = props.modelValue.value
})
</script>

<script lang="ts">
import { CommonForm, deconstructForm, defineForm } from '@/utils/FormUtils'
import { defineComponent, defineProps, PropType, ref, Ref, defineExpose, defineEmits, onMounted, computed, ComponentPublicInstance } from 'vue'
import { context } from '@/core/context'

export default defineComponent({
  name: 'SingleFieldForm'
})
</script>