<template>
  <base-form
    ref="formRef"
    row-height="81px"
    :model-value="formData"
    :submit-action="actions.submit"
  >
    <LoadingMask :loading="loadingRef" />
    <form-row style="margin-top: 12px">
      <form-col>
        <TextInput v-model="formData.name" label="会话名称" />
      </form-col>
      <form-col>
        <FormSelect v-model="formData.shell" label="shell" :items="shellOptions" />
      </form-col>
      <form-col>
        <FormSelect v-model="formData.charset" label="程序输出编码" :items="charsetOptions" />
      </form-col>
      <form-col top-label label="类型">
        <VCheckbox
          v-model="formData.pty"
          color="primary"
          :items="charsetOptions"
          label="模拟终端"
          hide-details
        />
      </form-col>
      <form-col class="mw-50" label="执行节点">
        <div class="d-flex align-center">
          <VCheckboxBtn
            v-model="isSpecifyHost"
            style="padding-top: 12px;"
            color="primary"
            :label="isSpecifyHost ? '' : '指定节点'"
          />
          <ClusterSelector
            v-if="isSpecifyHost"
            v-model="host"
            placeholder=""
            style="padding: 0;top: -6px"
          />
        </div>
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
    env: {},
    pty: true
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