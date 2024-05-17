<template>
  <v-form ref="form" v-model="formValid" @submit.prevent>
    <FormGrid>
      <FormRow>
        <FormCol>
          <TextInput
            v-if="inputOldPassword"
            v-model="originPassword"
            label="原密码"
            :rules="[rules.notNull, rules.validLength]"
            type="password"
            required
          />
        </FormCol>
      </FormRow>
      <FormRow>
        <FormCol>
          <TextInput
            v-model="newPassword"
            label="新密码"
            :rules="[rules.notNull, rules.validLength]"
            type="password"
            required
          />
        </FormCol>
      </FormRow>
      <FormRow>
        <FormCol>
          <TextInput
            v-model="replacePassword"
            label="确认密码"
            :rules="[rules.notNull, rules.passwordEquals]"
            type="password"
            required
            @keyup.enter="emits('submit')"
          />
        </FormCol>
      </FormRow>
    </FormGrid>
    
  </v-form>
</template>

<script setup lang="ts">
const formValid = ref(false)
const props = defineProps({
  uid: {
    type: Number,
    default: null
  },
  /**
   * 是否输入原密码
   */
  inputOldPassword: {
    type: Boolean,
    default: true
  },
  /**
   * 是否强制修改
   */
  forceChange: {
    type: Boolean,
    default: false
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
    throw new Error(res.errors.map(e => e.errorMessages).join(';'))
  }
  await SfcUtils.axios(API.user.modifyPasswd(props.uid === null ? userInfo.id : props.uid, originPassword.value, newPassword.value, props.forceChange))
  return true
}

const emits = defineEmits(['submit'])

defineExpose({
  submit
})
</script>

<script lang="ts">
import { defineComponent, ref, defineExpose, defineEmits } from 'vue'
import { context, ValidateResult } from 'sfc-common/core/context'
import API from 'sfc-common/api'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { FormCol, FormGrid, FormRow } from '../layout'
import { TextInput } from '../common'

export default defineComponent({
  name: 'ChangePasswordForm'
})
</script>