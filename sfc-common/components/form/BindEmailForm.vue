<template>
  <base-form ref="form" v-model="formData" :submit-action="submitAction">
    <loading-mask :loading="loading" />
    <template v-if="session.user.email">
      <v-list-subheader>旧邮箱验证</v-list-subheader>
      <v-row>
        <v-col>
          <text-input
            v-model="
              formData.originCode"
            label="请输入验证码"
            :rules="rules.originCode"
          />
        </v-col>
        <v-col sm="auto">
          <timeout-btn unique-key="sendOldEMail" @click="sendOldEmailCode">
            发送验证码
          </timeout-btn>
        </v-col>
      </v-row>
    </template>
    <v-list-subheader>新邮箱绑定</v-list-subheader>
    <v-row>
      <v-col>
        <text-input
          ref="newMailInput"
          v-model="formData.email"
          label="请输入新邮箱"
          :rules="rules.email"
          :error="errorInfo.newEmail.error"
          :error-message="errorInfo.newEmail.msg"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <text-input
          v-model="formData.newCode"
          label="请输入验证码"
          :rules="rules.newCode"
          :error="errorInfo.newEmail.error"
          :error-message="errorInfo.newEmail.msg"
        />
      </v-col>
      <v-col sm="auto">
        <timeout-btn unique-key="sendNewEMailCode" @click="sendNewEMailCode">
          发送验证码
        </timeout-btn>
      </v-col>
    </v-row>
  </base-form>
</template>

<script setup lang="ts">
import TextInput from '../common/TextInput.vue'
import BaseForm from '../common/BaseForm.vue'
import API from 'sfc-common/api'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { deconstructForm } from 'sfc-common/utils/FormUtils'
import { Validators } from 'sfc-common/core/helper/Validators'
import TimeoutBtn from '../common/btn/TimeoutBtn.vue'
import LoadingMask from '../common/LoadingMask.vue'
const loading = ref(false)
const newMailInput = ref()
const session = context.session
const formData = reactive({
  email: '',
  newCode: '',
  originCode: ''
})
const rules = {
  email: [Validators.notNull(), Validators.isEmail()],
  originCode: session.value.user.email ? [Validators.notNull()]:[],
  newCode: [Validators.notNull()]
}
const errorInfo = reactive({
  newEmail: {
    error: false,
    msg: ''
  }
})
const form = ref()

const submitAction = async() => {
  try {
    loading.value = true
    await SfcUtils.axios(API.user.bindNewEmail(formData.email, formData.originCode, formData.newCode))
    const newToken = (await SfcUtils.axios(API.user.updateToken())).data.data
    context.session.value.setToken(newToken)
    const userInfo = (await SfcUtils.axios(API.user.getUserInfo())).data.data
    context.session.value.setUserInfo(userInfo)
  } finally {
    loading.value = false
  }
  
}

const sendOldEmailCode = async(e: Function) => {
  try {
    loading.value = true
    await SfcUtils.axios(API.user.sendVerifyEmail())
    e()
  } catch(err: any) {
    SfcUtils.snackbar(err.toString())
  } finally {
    loading.value = false
  }
}

const sendNewEMailCode = async(e: Function) => {
  try {
    loading.value = true
    const ret = (await newMailInput.value.validate()) as ValidateResult
    if (!ret.valid) {
      SfcUtils.snackbar(ret.errors[0].errorMessages)
      return
    }
    await SfcUtils.axios(API.user.sendBindEmail(formData.email))
    e()
  } catch(err: any) {
    SfcUtils.snackbar(err.toString())
  } finally {
    loading.value = false
  }
}

defineExpose(deconstructForm(form))
</script>

<script lang="ts">
import { defineComponent, reactive, defineExpose, ref } from 'vue'
import { context, ValidateResult } from 'sfc-common/core/context'

export default defineComponent({
  name: 'BindEmailForm'
})
</script>