<template>
  <base-form
    ref="formRef"
    row-height="81px"
    :model-value="formData"
    :submit-action="actions.submit"
  >
    <LoadingMask :loading="loadingRef" />
    <form-row style="margin-top: 12px">
      <form-col top-label label="会话名称">
        <TextInput v-model="formData.name" />
      </form-col>
      <form-col top-label label="shell">
        <FormSelect v-model="formData.shell" :items="shellOptions" />
      </form-col>
      <form-col top-label label="程序输出编码">
        <FormSelect v-model="formData.charset" :items="charsetOptions" />
      </form-col>
      <form-col top-label label="执行节点">
        <VCheckboxBtn v-model="isSpecifyHost" color="primary" />
        <ClusterSelector v-if="isSpecifyHost" v-model="host" placeholder="" />
        <span
          v-else
          class="tip"
          style="font-size: 16px;cursor: pointer;"
          @click="isSpecifyHost=true"
        >指定节点</span>
      </form-col>
    </form-row>
  </base-form>
</template>

<script setup lang="ts">
/* VS Code代码片段生成 prefix: vform */
import { CommonForm, MethodInterceptor, SelectOption, defineForm } from 'sfc-common'
const SfcUtils = window.SfcUtils
const formRef = ref() as Ref<CommonForm>
const emits = defineEmits(['submit'])

const shellOptions = [{
  title: '/bin/bash',
  value: '/bin/bash'
},{
  title: 'powershell',
  value: 'powershell'
}] as SelectOption[]

const isSpecifyHost = ref(false)
const host = ref('')

const charsetOptions = [{
  title: 'UTF-8',
  value: 'UTF-8'
},{
  title: 'GBK',
  value: 'GBK'
}] as SelectOption[]

const formInst = defineForm({
  actions: {
    async submit() {
      loadingManager.beginLoading()
      try {
        const res = await SfcUtils.request(WebShellApi.createSession(formData, isSpecifyHost.value ? host.value : undefined))
        emits('submit', formData)
        return res
      } finally {
        loadingManager.closeLoading()
      }
    },
  },
  formData: {
    name: '新建会话',
    shell: '/bin/bash',
    charset: 'UTF-8',
    env: {}
  } as ShellExecuteParameter,
  formRef: formRef,
  validators: {},
  throwError: true
})
const { formData, actions, validators, loadingRef, loadingManager  } = formInst


defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { ShellExecuteParameter, ShellSessionRecord } from '../model'
import { WebShellApi } from '../api'

export default defineComponent({
  name: 'WsCreateSessionForm'
})
</script>