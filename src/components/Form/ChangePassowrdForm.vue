<template>
  <v-form ref="form" v-model="formValid">
    <v-text-field
      v-model="originPassword"
      label="原密码"
      :rules="[rules.notNull, rules.validLength]"
      type="password"
      required
    />
    <v-text-field
      v-model="newPassword"
      label="新密码"
      :rules="[rules.notNull, rules.validLength]"
      type="password"
      required
    />
    <v-text-field
      v-model="replacePassword"
      label="确认密码"
      :rules="[rules.notNull, rules.passwordEquals]"
      type="password"
      required
      @keyup.enter="emits('submit')"
    />
    
  </v-form>
</template>

<script setup lang="ts">
const formValid = ref(false)
const props = defineProps({
  uid: {
    type: Number,
    default: null
  }
})
const userInfo = context.session.value.user
const originPassword = ref('')
const newPassword = ref('')
const replacePassword = ref('')
const form = ref()
const rules = {
  notNull: (e:string) => !!e || '该项必填',
  passwordEquals: () => newPassword.value == replacePassword.value ? true : '与新密码不一致',
  validLength: (e:string) => e.length >= 6 || '密码不能小于6位'
}
const submit = async() => {
  const res: ValidateResult = await form.value.validate()
  if (!res.valid) {
    throw new Error('表单校验不通过')
  }
  await SfcUtils.axios(API.user.modifyPasswd(userInfo.id, originPassword.value, newPassword.value))
  return true
}

const emits = defineEmits(['submit'])

defineExpose({
  submit
})
</script>

<script lang="ts">
import { defineComponent, ref, defineExpose, defineEmits } from 'vue'
import { context, ValidateResult } from '@/core/context'
import API from '@/api'
import SfcUtils from '@/utils/SfcUtils'

export default defineComponent({
  name: 'ChangePasswordForm'
})
</script>