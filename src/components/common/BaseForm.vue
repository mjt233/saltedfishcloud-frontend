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
const formManager = inject<FormManager>('formManager')
defineEmits(['update:modelValue'])
const formInst = defineForm({
  formData: props.modelValue,
  formRef: form,
  sonForm: props.sonForms as any as Ref<CommonForm>[],
  submitAction: props.submitAction as () => Promise<any> | null | undefined
})

if (formManager) {
  formManager.register(formInst)
}

onUnmounted(() => {
  if(formManager) {
    formManager.remove(formInst.getId())
  }
})
defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent, defineProps, ref, defineExpose, defineEmits, Ref, inject, onUnmounted, onMounted } from 'vue'
import { defineForm, CommonForm } from '@/utils/FormUtils'
import { FormManager } from '@/utils/FormUtils/FormManager'

export default defineComponent({
  name: 'BaseForm'
})
</script>