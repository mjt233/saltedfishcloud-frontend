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
    <FormGrid row-height="68px" style="margin: 18px 0 12px 0" label-gap="-6px">
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
        <FormCol top-label class="mw-50" style="padding: 0;height: 32px;margin-bottom: 12px">
          <VCheckbox
            v-model="formData.useCard"
            :true-value="1"
            :false-value="0"
            color="primary"
            label="使用卡片样式"
            hide-details
          />
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
    <div class="text-h6" style="margin-top: 12px">
      额外json配置项
    </div>
    <CodeEditor v-model="extraJson" language="json" />
  </base-form>
</template>

<script setup lang="ts">
import API from '@/api'
import BaseForm from '@/components/common/BaseForm.vue'
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

const extraJson = ref('{\n\n}')
watch(extraJson, () => {
  try {
    if (extraJson.value) {
      const extraObj = JSON.parse(extraJson.value)
      Object.keys(extraObj).forEach(key => {
        customConfigObj[key] = extraObj[key]
      })
      Object.keys(customConfigObj).forEach(key => {
        if (extraObj[key] == undefined) {
          delete customConfigObj[key]
        }
      })
    } else {
      customConfigObj = {}
    }
    updateParams()
  } catch (ignore) {

  }
  
})

const updateParams = () => {
  formData.params = JSON.stringify(customConfigObj)
}

/**
 * 反序列化params后，将未在组件自定义配置项中声明的参数挑出来作为json手动编辑展示
 */
const updateExtraJson = () => {
  const config = props.component.config || []
  const paramSet = new Set<string>()
  const extraObj:any = {}
  config.forEach(c => paramSet.add(c.name))
  Object.keys(customConfigObj).forEach(key => {
    if (!paramSet.has(key)) {
      extraObj[key] = customConfigObj[key]
    }
  })

  // 执行json序列化，并格式化json字符串
  const extraKeys = Object.keys(extraObj)
  if (extraKeys.length) {
    extraJson.value = '{\n'
    extraJson.value += extraKeys.map(key => {
      return `  ${JSON.stringify(key)}: ${JSON.stringify(customConfigObj[key])}`
    }).join(',\n')
    extraJson.value += '\n}'
    
  }
  
}

/**
 * 校验额外json语法是否合法
 */
const validJson = () => {
  if (extraJson.value && extraJson.value.length) {
    try {
      JSON.parse(extraJson.value)
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new Error('json语法错误：' + err.message)
      } else {
        throw err
      }
      
    }
    
  }
}

const formInst = defineForm({
  actions: {
    async submit() {
      validJson()
      return await SfcUtils.request(API.desktop.saveComponentConfig(formData))
    }
  },
  formData: {
    width: 4,
    height: -1,
    remark: '',
    showOrder: 10,
    uid: props.uid,
    params: '{}',
    name: props.component.name,
    type: 'vue',
    enabled: 1,
    useCard: 1
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
  updateExtraJson()
})



defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, computed, watch } from 'vue'

export default defineComponent({
  name: 'DesktopConfigForm'
})
</script>
