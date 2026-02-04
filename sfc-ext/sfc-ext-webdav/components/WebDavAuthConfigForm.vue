<template>
  <BaseForm ref="formRef" :model-value="formData" :submit-action="actions.submit">
    <VTextField
      v-model="formData.password"
      label="新密码"
      type="password"
      placeholder="请输入新密码"
      persistent-hint
      :rules="validators.password"
      required
      variant="underlined"
      color="primary"
    />
    
    <VTextField
      v-model="formData.confirmPassword"
      label="确认密码"
      type="password"
      placeholder="请再次输入密码"
      :rules="validators.confirmPassword"
      required
      variant="underlined"
      color="primary"
    />
  </BaseForm>
</template>

<script setup lang="ts">
/* VS Code代码片段生成 prefix: vform */
import { CommonForm, defineForm, FormFieldType, IdType, Validators } from 'sfc-common'
const formRef = ref() as Ref<CommonForm>
const props = defineProps({
  uid: {
    type: [String, Number] as PropType<IdType>,
    required: true
  }
})
const emits = defineEmits(['submit'])

const formInst = defineForm({
  actions: {
    async submit() {
      return await window.SfcUtils.request(WebDavApi.setWebDavPassword(props.uid, formData.password))
    }
  },
  formData: {
    password: '',
    confirmPassword: ''
  },
  formRef: formRef,
  validators: {
    password: [ Validators.minLen('密码至少需要6位', 6) ],
    confirmPassword: [
      Validators.minLen('密码至少需要6位', 6),
      (val: FormFieldType) => {
        if (val !== formData.password) {
          return '两次输入的密码不一致'
        }
        return true
      }
    ]
  },
  throwError: true
})
const { formData, actions, validators, loadingRef, loadingManager  } = formInst


defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed } from 'vue'
import { WebDavApi } from '../webDavApi'

export default defineComponent({
  name: 'WebDavAuthConfigForm'
})
</script>


<style scoped>
.webdav-auth-config-form {
  width: 100%;
}
</style>