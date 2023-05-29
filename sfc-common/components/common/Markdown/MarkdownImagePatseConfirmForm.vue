<template>
  <base-form
    ref="formRef"
    :model-value="formData"
    :submit-action="actions.submit"
    :son-forms="sonForms"
  >
    <form-row>
      <form-col label="文件名" top-label>
        <text-input v-model="formData.name" />
      </form-col>
    </form-row>
    <MarkdownImagePatseForm ref="configFormRef" style="padding: 0px" :show-title="false" />
  </base-form>
</template>

<script setup lang="ts">
import { CommonForm, defineForm } from 'sfc-common'
const formRef = ref() as Ref<CommonForm>
const props = defineProps({
  fileName: {
    type: String,
    default: ''
  }
})
const emits = defineEmits(['submit'])
const configFormRef = ref() as Ref<CommonForm>

const sonForms =  [configFormRef]

const formInst = defineForm({
  actions: {
    submit() {
      sonForms.forEach(e => e.value.submit())
    }
  },
  formData: {
    name: ''
  },
  formRef: formRef,
  validators: {},
  throwError: true
})
const { formData, actions, validators, loadingRef, loadingManager  } = formInst


defineExpose(formInst)
onMounted(() => {
  formData.name = props.fileName
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed, onMounted } from 'vue'
import MarkdownImagePatseForm from './MarkdownImagePatseForm.vue'

export default defineComponent({
  name: 'MarkdownImagePatseConfirmForm',
  components: { MarkdownImagePatseForm }
})
</script>