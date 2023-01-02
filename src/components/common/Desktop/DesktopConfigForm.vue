<template>
  <base-form
    ref="formRef"
    :model-value="formData"
    :submit-action="actions.submit"
    auto-loading
  >
    <div class="d-flex">
      <div><CommonIcon color="primary" :icon="component.icon" /></div>
      <div>
        <div>{{ component.title }}</div>
        <div class="tip">
          {{ component.describe }}
        </div>
      </div>
    </div>
    <VDivider style="margin-top: 6px" />
    <div class="text-h6">
      标准配置项
    </div>
    <FormGrid row-height="56px" style="margin: 18px 0 12px 0" label-gap="-6px">
      <FormRow>
        <FormCol top-label label="显示顺序" class="mw-50">
          <TextInput v-model="formData.showOrder" />
        </FormCol>
        <FormCol top-label label="标题" class="mw-50">
          <TextInput v-model="formData.title" />
        </FormCol>
        <FormCol top-label label="宽度" class="mw-50">
          <TextInput v-model="formData.width" />
        </FormCol>
        <FormCol top-label label="高度" class="mw-50">
          <TextInput v-model="formData.height" />
        </FormCol>
      </FormRow>
      <FormRow style="margin-top: 12px">
        <FormCol top-label label="备注">
          <TextInput v-model="formData.remark" />
        </FormCol>
      </FormRow>
    </FormGrid>
    <div class="text-h6">
      组件配置项
    </div>
    <div v-if="component.config && component.config.length">
      <ConfigurableForm :nodes="customConfig" @change="customChange" />
    </div>
    <EmptyTip v-else />
  </base-form>
</template>

<script setup lang="ts">
import API from '@/api'
import BaseForm from '@/components/common/BaseForm.vue'
import { context } from '@/core/context'
import { ConfigNodeModel, NameValueType } from '@/core/model'
import { DesktopComponent, DesktopComponentConfig } from '@/core/model/Desktop'
import { CommonForm, defineForm } from '@/utils/FormUtils'
import SfcUtils from '@/utils/SfcUtils'
const formRef = ref() as Ref<CommonForm>
const props = defineProps({
  initValue: {
    type: Object as PropType<DesktopComponentConfig>,
    default: undefined
  },
  component: {
    type: Object as PropType<DesktopComponent>,
    default() { return {} }
  },
  uid: {
    type: [String, Number],
    default: 0
  }
})
const emits = defineEmits(['submit'])
const customConfig = computed(() => {
  const params = props.initValue?.params || '{}'
  const paramsObj = JSON.parse(params)
  return [{
    nodes: props.component.config.map(node => {
      const newNode = {} as ConfigNodeModel
      Object.assign(newNode, node)
      newNode.value = paramsObj[node.name]
      return newNode
    })
  }] as ConfigNodeModel[]
})
let customConfigObj = {} as {[k: string]:any}

const updateParams = () => {
  formData.params = JSON.stringify(customConfigObj)
}

const formInst = defineForm({
  actions: {
    async submit() {
      return await SfcUtils.request(API.desktop.saveComponentConfig(formData))
    }
  },
  formData: {
    width: 4,
    height: -1,
    remark: '',
    showOrder: 0,
    uid: props.uid,
    params: '{}',
    name: props.component.name,
    type: 'vue'
  } as DesktopComponentConfig,
  formRef: formRef,
  validators: {},
  throwError: true
})
const { formData, actions, validators, loadingRef, loadingManager  } = formInst

const customChange = (e: NameValueType) => {
  customConfigObj[e.name] = e.value
  updateParams()
}
onMounted(() => {
  if (props.initValue) {
    Object.assign(formData, props.initValue)
    customConfigObj = JSON.parse(formData.params || '{}')
  } else {
    formData.uid = props.uid
  }
})



defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, computed } from 'vue'

export default defineComponent({
  name: 'DesktopConfigForm'
})
</script>