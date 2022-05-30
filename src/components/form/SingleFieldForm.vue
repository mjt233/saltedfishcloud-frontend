<template>
  <base-form ref="form" v-model="formData">
    <text-input
      ref="inputRef"
      :autofocus="autofocus"
      :label="label"
      :rules="rules"
      :model-value="modelValue"
      @enter="emits('enter')"
      @update:value="emits('update:modelValue', $event)"
    />
  </base-form>
</template>

<script setup lang="ts">
import BaseForm from '../common/BaseForm.vue'
import TextInput from '../common/TextInput.vue'
import { ValidateRule } from '@/core/model/component/type'
const val = computed(() => {
  return props.modelValue
})
const formData = {
  value: val
}
const inputRef = ref() as Ref<ComponentPublicInstance>
const form = ref() as Ref<CommonForm>
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
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
const focus = () => {
  console.log(inputRef.value.$el)
  inputRef.value.$el.focus()
}
defineExpose({
  focus,
  ...deconstructForm(form)
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