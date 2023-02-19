<template>
  <base-form
    ref="formRef"
    :model-value="formData"
    :submit-action="actions.submit"
    label-width="92px"
    :auto-loading="true"
  >
    <form-row>
      <form-col label="代理名称">
        <text-input v-model="formData.name" :rules="validators.name" />
      </form-col>
      <form-col label="代理类型">
        <form-select
          v-model="formData.type"
          dense
          :items="proxyTypeOptions"
          color="primary"
        />
      </form-col>
      <form-col label="服务器地址">
        <text-input v-model="formData.address" :rules="validators.address" />
      </form-col>
      <form-col label="服务器端口">
        <text-input v-model="formData.port" :rules="validators.port" />
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

export default defineComponent({
  name: 'ProxyConfigForm'
})
</script>