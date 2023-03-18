<template>
  <base-form
    ref="form"
    v-model="formData"
    :submit-action="actions.doSubmit"
  >
    <loading-mask :loading="loading" />
    <text-input v-model="formData.data" :rules="validators.data" />
  </base-form>
</template>

<script setup lang="ts">
import TextInput from '../common/TextInput.vue'
import BaseForm from '../common/BaseForm.vue'
import LoadingMask from '../common/LoadingMask.vue'
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()
const formData = reactive({
  data: ''
})
const form = ref() as Ref<CommonForm>
const validators = {
  data: [Validators.notNull('不能为空')]
}
const originActions = {
  async doSubmit() {

  }
}
const actions = MethodInterceptor.createAutoCatch(
  MethodInterceptor.createAutoLoadingProxy(originActions, loadingManager)
  ,true
)
const props = defineProps({
  uid: {
    type: Number,
    default: 0
  }
})
const formInst = deconstructForm(form)
const emit = defineEmits(['submit'])
const emitSubmit = async() => {
  const result = await formInst.validate()
  if (result.valid) {
    emit('submit')
  }
}
defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent, reactive, ref, defineProps, defineExpose, defineEmits, Ref, ComponentPublicInstance } from 'vue'
import API from 'sfc-common/api'
import { MethodInterceptor } from 'sfc-common/utils/MethodInterceptor'
import { LoadingManager } from 'sfc-common/utils/LoadingManager'
import { CommonForm, deconstructForm } from 'sfc-common/utils/FormUtils'
import { Validators } from 'sfc-common/core/helper/Validators'
import SfcUtils from 'sfc-common/utils/SfcUtils'

export default defineComponent({
  name: 'CreateDownloadForm'
})
</script>