<template>
  <base-form ref="formRef" :model-value="formData" :submit-action="actions.submit">
    <FormRow>
      <FormCol>
        <TextInput v-model="formData.siteName" label="站点名称" :rules="validators.siteName" />
      </FormCol>
      <FormCol label="访问方式">
        <VRadioGroup v-model="formData.accessWay" inline color="primary">
          <VRadio :value="1" label="按主机名" />
          <VRadio :disabled="initObject?.uid == 0" :value="2" label="按用户路径" />
        </VRadioGroup>
      </FormCol>
    </FormRow>
    <FormRow>
      <FormCol label="部署路径">
        <span class="tip">{{ formData.path }}</span>
        <VBtn flat @click="selectPath">
          浏览
        </VBtn>
      </FormCol>
    </FormRow>
    <FormRow>
      <FormCol label="启用index.html主页">
        <VSwitch v-model="formData.isEnableIndex" color="primary" :label="formData.isEnableIndex ? '已启用' : '已停用'" />
      </FormCol>
      <FormCol label="启用目录浏览">
        <VSwitch v-model="formData.isEnableFileList" color="primary" :label="formData.isEnableFileList ? '已启用' : '已停用'" />
      </FormCol>
      <FormCol label="启用身份验证">
        <span v-if="formData.isNeedLogin" class="tip">安全须知: 该功能基于原始HTTP身份验证机制，用户访问登录时，若不采用可信的HTTPS传输则存在中间人截取的可能。且用户名和密码在咸鱼云上的保存未经混淆或加密</span>
        <VSwitch v-model="formData.isNeedLogin" color="primary" :label="formData.isNeedLogin ? '已启用' : '已停用'" />
      </FormCol>
    </FormRow>
    <FormRow v-if="formData.isNeedLogin">
      <FormCol>
        <TextInput v-model="formData.loginUsername" label="验证用户名" :rules="validators.loginUsername" />
      </FormCol>
      <FormCol>
        <TextInput
          v-model="formData.loginPassword"
          type="password"
          label="验证密码"
          :rules="validators.loginPassword"
        />
      </FormCol>
    </FormRow>
    <FormRow>
      <FormCol label="URL预览">
        {{ getSiteUrl(formData) }}
      </FormCol>
    </FormRow>
  </base-form>
</template>

<script setup lang="ts">
/* VS Code代码片段生成 prefix: vform */
import { CommonForm, FormFieldType, IdType, Validators, defineForm } from 'sfc-common'
const formRef = ref() as Ref<CommonForm>
const props = defineProps({
  initObject: {
    type: Object as PropType<StaticPublishRecord>,
    default: undefined
  },
  uid: {
    type: [String, Number] as PropType<IdType>,
    default: 0
  }
})
const emits = defineEmits(['submit'])
const SfcUtils = window.SfcUtils

const formInst = defineForm({
  actions: {
    submit() {
    
    }
  },
  formData: {
    siteName: '',
    accessWay: 2,
    isEnableIndex: false,
    isEnableFileList: false,
    isNeedLogin: false,
    loginUsername: '',
    loginPassword: '',
    path: '/'
  } as StaticPublishRecord,
  formRef: formRef,
  validators: {
    siteName: [
      Validators.minLen('站点名称不能为空', 1),
      Validators.maxLen('站点名称不能超过255个字符', 255),
      (val: FormFieldType) => {
        if (formData.accessWay == 1) {
          return Validators.isMatchRegex('^([0-9a-zA-Z]|\\-)*$', '主机站点名称只能使用:数字 字符 -')(val)
        }
        return true
      }
    ],
    loginUsername: [
      Validators.maxLen('验证用户名不能超过32个字符', 32),
    ],
    loginPassword: [
      Validators.maxLen('验证密码不能超过255个字符', 255),
    ]
  },
  throwError: true
})
const { formData, actions, validators, loadingRef, loadingManager  } = formInst

const property = StaticPublishApi.getProperty()
const selectPath = async() => {
  try {
    formData.path = await SfcUtils.selectPath({
      path: formData.path,
      title: '选择站点部署路径',
      uid: formData.uid,
      readOnly: true
    })
  } catch (err) {
    if (err != 'cancel') {
      console.error(err)
      SfcUtils.snackbar(err)
    }
  }
}

const getSiteUrl = (record: StaticPublishRecord) => {
  if (record.accessWay == 1) {
    return `${property.protocol}://${record.siteName}.${property.byHostSuffix}`
  } else {
    return `${property.protocol}://${record.username || '[用户名]'}.${property.byPathSuffix}/${record.siteName}`
  }
}

onMounted(() => {
  if (props.initObject) {
    Object.assign(formData, props.initObject)
    if (props.initObject.uid == 0 && !props.initObject.id) {
      formData.accessWay = 1
    }
    if (formData.loginUsername === null) {
      formData.loginUsername = ''
    }
    if (formData.loginPassword === null) {
      formData.loginPassword = ''
    }
  }
})

defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { StaticPublishRecord } from '../model'
import { onMounted } from 'vue'
import StaticPublishApi from '../api'

export default defineComponent({
  name: 'StaticPublishRecordForm'
})
</script>