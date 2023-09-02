<template>
  <base-form
    ref="formRef"
    :model-value="formData"
    :submit-action="actions.submit"
    :auto-loading="true"
  >
    <form-row>
      <form-col>
        <form-select
          v-model="formData.type"
          placeholder="代理类型"
          :items="proxyTypeOptions"
        />
      </form-col>
    </form-row>
    <form-row style="flex-direction: column;">
      <form-col>
        <text-input v-model="formData.name" label="代理名称" :rules="validators.name" />
      </form-col>
      <form-col>
        <text-input v-model="formData.address" label="服务器地址" :rules="validators.address" />
      </form-col>
      <form-col>
        <text-input v-model="formData.port" label="服务器端口" :rules="validators.port" />
      </form-col>
    </form-row>
  </base-form>
</template>

<script setup lang="ts">
import BaseForm from 'sfc-common/components/common/BaseForm.vue'
import { CommonForm, defineForm } from 'sfc-common/utils/FormUtils'
import FormSelect from '../FormSelect.vue'
const formRef = ref() as Ref<CommonForm>
const props = defineProps({
  initValue: {
    type: Object as PropType<ProxyInfo>,
    default: undefined
  }
})
const emits = defineEmits(['submit'])

const proxyTypeOptions: SelectOption[] = [
  {
    title: 'SOCKS',
    value: 'SOCKS'
  },
  {
    title: 'HTTP',
    value: 'HTTP'
  }
]
const formInst = defineForm({
  actions: {
    submit() {
      if (props.initValue) {
        return SfcUtils.request(API.admin.proxy.updateProxy(props.initValue.name, formData))
      } else {
        return SfcUtils.request(API.admin.proxy.addProxy(formData))
      }
      
    }
  },
  formData: {
    type: 'SOCKS',
    name: '新的代理',
    address: '127.0.0.1',
    port: 1080
  } as ProxyInfo,
  formRef: formRef,
  validators: {
    port: [
      Validators.maxNum(65535),
      Validators.minNum(1),
    ],
    address: [
      Validators.notNull()
    ],
    name: [
      Validators.notNull()
    ]
  },
  throwError: true
})
const { formData, actions, validators, loadingRef, loadingManager  } = formInst

if (props.initValue) {
  Object.assign(formData, props.initValue)
}

defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { ProxyInfo, SelectOption } from 'sfc-common/model'
import { Validators } from 'sfc-common/core/helper/Validators'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import API from 'sfc-common/api'
import { FormCol, FormRow } from 'sfc-common/components/layout'

export default defineComponent({
  name: 'ProxyConfigForm'
})
</script>