<template>
  <base-form ref="form" v-model="formData">
    <text-input
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
  }
})
const emits = defineEmits(['update:modelValue', 'enter'])
defineExpose(deconstructForm(form))

</script>

<script lang="ts">
import { CommonForm, deconstructForm, defineForm } from '@/utils/FormUtils'
import { defineComponent, defineProps, PropType, ref, Ref, defineExpose, defineEmits, onMounted, computed } from 'vue'
import { context } from '@/core/context'

export default defineComponent({
  name: 'SingleFieldForm'
})
</script>