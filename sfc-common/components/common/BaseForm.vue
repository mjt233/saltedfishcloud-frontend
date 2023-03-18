<template>
  <v-form
    ref="form"
    class="base-form"
    :style="{'--form-label-width': labelWidth, '--row-height': rowHeight}"
    :class="{'dense-form': dense}"
  >
    <loading-mask :loading="loading && autoLoading" />
    <slot />
  </v-form>
</template>

<script setup lang="ts">
import LoadingMask from './LoadingMask.vue'
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
  },
  labelWidth: {
    type: String,
    default: '120px'
  },
  dense: {
    type: Boolean,
    default: false
  },
  rowHeight: {
    type: String,
    default: '108px'
  },
  /**
   * 是否自动管理表单提交时的loading
   */
  autoLoading: {
    type: Boolean,
    default: false
  }
})
const formManager = inject<FormManager>('formManager', new FormManager())
defineEmits(['update:modelValue'])
const formInst = defineBaseForm({
  formData: props.modelValue,
  formRef: form,
  sonForm: props.sonForms as any as Ref<CommonForm>[],
  submitAction: props.submitAction as () => Promise<any> | null | undefined,
  formManager
})

const loading = formInst.getFormLoadingRef()

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
import { defineBaseForm, CommonForm } from 'sfc-common/utils/FormUtils'
import { FormManager } from 'sfc-common/utils/FormUtils/FormManager'

export default defineComponent({
  name: 'BaseForm'
})
</script>