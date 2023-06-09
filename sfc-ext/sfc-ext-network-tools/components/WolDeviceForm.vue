<template>
  <base-form ref="formRef" :model-value="formData" :submit-action="actions.submit">
    <LoadingMask :loading="loading" />
    <FormRow>
      <FormCol label="设备名称" top-label>
        <TextInput
          v-model="formData.name"
          :rules="validators.name"
          placeholder="起个名字吧~"
          :readonly="readOnly"
        />
      </FormCol>
      <FormCol label="MAC地址" top-label>
        <TextInput
          v-model="formData.mac"
          :rules="validators.mac"
          placeholder="很重要！唤醒全靠这个了"
          :readonly="readOnly"
        />
      </FormCol>
      <FormCol label="端口(udp)" top-label>
        <TextInput
          v-model="formData.port"
          :rules="validators.port"
          placeholder="默认UDP端口-9"
          :readonly="readOnly"
        />
      </FormCol>
      <FormCol label="IP地址(ipv4)" top-label>
        <TextInput
          v-model="formData.ip"
          :rules="validators.ip"
          placeholder="用来检测是否在线"
          :readonly="readOnly"
        />
      </FormCol>
    </FormRow>
  </base-form>
</template>

<script setup lang="ts">
/* VS Code代码片段生成 prefix: vform */
import { CommonForm, Validators, defineForm } from 'sfc-common'
import { Components } from 'sfc-common'
const SfcUtils = window.SfcUtils
const formRef = ref() as Ref<CommonForm>
const props = defineProps({
  initObject: {
    type: Object as PropType<WolDevice>,
    default: undefined
  },
  readOnly: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['submit'])

const formInst = defineForm({
  actions: {
    async submit() {
      return await SfcUtils.request(NwtApi.Wol.saveWolDevice(formData))
    }
  },
  formData: {
    name: '',
    port: 9,
    ip: '',
    mac: ''
  } as WolDevice,
  formRef: formRef,
  validators: {
    name: [Validators.notNull(), Validators.maxLen('不能大于255个字符', 255)],
    mac: [Validators.isMatchRegex('^([abcdefABCDEF\\d]{2}[:\\-]?){6}$', '不是有效的mac地址')],
    ip: [
      Validators.notNull(),
      Validators.isMatchRegex(
        '^((2((5[0-5])|([0-4]\\d)))|([0-1]?\\d{1,2}))(\\.((2((5[0-5])|([0-4]\\d)))|([0-1]?\\d{1,2}))){3}$',
        '不是有效的ipv4地址'
      )
    ],
    port: [
      Validators.minNum(1), Validators.maxNum(65535)
    ]
  },
  throwError: true
})
const { formData, actions, validators, loadingRef, loadingManager  } = formInst
const loading = loadingManager.getLoadingRef()

if (props.initObject) {
  Object.assign(formData, props.initObject)
}

defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { WolDevice } from '../model'
import { NwtApi } from '../api'

export default defineComponent({
  name: 'WolDeviceForm',
  components: {
    FormRow: Components.FormRow,
    FormCol: Components.FormCol,
    TextInput: Components.TextInput
  }
})
</script>