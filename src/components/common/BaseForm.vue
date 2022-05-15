<template>
  <v-form ref="form">
    <slot />
  </v-form>
</template>

<script setup lang="ts">
const form = ref()
const props = defineProps({
  submitAction: {
    type: Function,
    default: () => {}
  },
  sonForms: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: Object,
    default: () => { {} }
  }
})
defineEmits(['update:modelValue'])
defineExpose(defineForm({
  formData: props.modelValue,
  formRef: form,
  sonForm: props.sonForms as any as Ref<CommonForm>[],
  submitAction: props.submitAction as () => Promise<any> | null | undefined
}))
</script>

<script lang="ts">
import { defineComponent, defineProps, ref, defineExpose, defineEmits, Ref } from 'vue'
import { context } from '@/core/context'
import { defineForm, CommonForm } from '@/utils/FormUtils'

export default defineComponent({
  name: 'BaseForm'
})
</script>