<template>
  <v-card color="background" style="overflow: hidden">
    <loading-mask :loading="loading" />
    <v-list-item>
      <!-- 头像 -->
      <v-list-item-avatar>
        <v-img :src="avatar" />
      </v-list-item-avatar>

      <!-- 标题 -->
      <div style="margin: 8px 16px;">
        <v-list-item-title class="headline">
          注册账号
        </v-list-item-title>
        <v-list-item-subtitle>咸鱼云通行证</v-list-item-subtitle>
      </div>
    </v-list-item>
    <v-tabs
      v-model="regType"
      background-color="background"
      color="primary"
      grow
    >
      <v-tab v-if="context.feature.value.enableRegCode" value="regCode">
        邀请码
      </v-tab>
      <v-tab v-if="context.feature.value.enableEmailReg" value="email" optional>
        邮箱注册
      </v-tab>
    </v-tabs>
    <v-card-content>
      <base-register-form ref="baseForm" />
      <base-form
        ref="extraForm"
        v-model="extraFormData"
        :son-forms="sonForms"
        :submit-action="submitAction"
      >
        <v-window v-model="regType" style="padding-top: 8px;top: -8px; position:relative">
          <v-window-item value="regCode">
            <text-input v-model="extraFormData.regCode" :rules="extraRules.regCode" label="邀请码" />
          </v-window-item>
          <v-window-item value="email">
            <v-row>
              <v-col>
                <text-input
                  ref="emailInput"
                  v-model="extraFormData.email"
                  :error-messages="errorInfo.email.msg"
                  :error="errorInfo.email.error"
                  :rules="extraRules.email"
                  label="邮箱"
                  @input="updateErrorInfo"
                  @blur="updateErrorInfo"
                />
              </v-col>
              <v-col md="auto">
                <div style="width: 120px" class="d-flex justify-center">
                  <timeout-btn unique-key="email" @click="sendEmailCode">
                    获取验证码
                  </timeout-btn>
                </div>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <text-input
                  v-model="extraFormData.emailCode"
                  :rules="extraRules.emailCode"
                  label="邮箱验证码"
                  @enter="emitSubmit"
                />
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </base-form>
      <v-btn color="primary" width="100%" @click="emitSubmit">
        立即注册
      </v-btn>
    </v-card-content>
    
  </v-card>
</template>

<script setup lang="ts">
import BaseRegisterForm from './BaseRegisterForm.vue'
import TextInput from '@/components/common/TextInput.vue'
import { defineForm, CommonForm, deconstructForm } from '@/utils/FormUtils'
import SfcUtils from '@/utils/SfcUtils'
import API from '@/api'
import LoadingMask from '@/components/common/LoadingMask.vue'
import BaseForm from '@/components/common/BaseForm.vue'
import TimeoutBtn from '@/components/common/btn/TimeoutBtn.vue'
import { StringUtils } from '@/utils/StringUtils'
const avatar = context.defaultAvatar.value
const baseForm = ref()
const extraForm = ref()
const regType = ref('regCode')
const loading = ref(false)
const emailInput = ref()
const extraFormData = reactive({
  regCode: '',
  email: '',
  emailCode: ''
})
const errorInfo = reactive({
  email: {
    error: false,
    msg: ''
  }
})
const extraRules = computed(() => {
  if (regType.value == 'regCode') {
    return {
      regCode: [Validators.notNull()],
      email: [],
      emailCode: []
    }
  } else {
    return {
      regCode: [],
      email: [Validators.notNull(), Validators.isEmail()],
      emailCode: [Validators.notNull()]
    }
  }
})
const sonForms = [ baseForm ]
const submitAction = async() => {
  const baseFormData = baseForm.value.getFormData()
  try {
    loading.value = true
    return await SfcUtils.axios(API.user.regUser({
      email: extraFormData.email,
      regcode: extraFormData[regType.value == 'regCode' ? 'regCode' : 'emailCode'],
      user: baseFormData.username,
      validEmail: regType.value == 'email',
      passwd: baseFormData.password
    }))
  } finally {
    loading.value = false
  }
}
const emit = defineEmits(['submit'])
const emitSubmit = () => {
  emit('submit')
}
const updateErrorInfo = () => {

  if (!StringUtils.isEmail(extraFormData.email)) {
    errorInfo.email.error = true
    errorInfo.email.msg = '不是有效的邮箱格式'
    return
  } else {
    errorInfo.email.error = false
    errorInfo.email.msg = ''
  }
}

const sendEmailCode = async(e: any) => {
  updateErrorInfo()
  if (errorInfo.email.error) {
    return
  }
  try {
    loading.value = true
    await SfcUtils.axios(API.user.getEmailRegCode(extraFormData.email))
    e()
  } catch (err: any) {
    SfcUtils.snackbar(err.toString())
  } finally {
    loading.value = false
  }
  
}
defineExpose(deconstructForm(extraForm))
</script>

<script lang="ts">
import { computed, defineComponent, reactive, ref, toRefs, watch } from 'vue'
import { context } from '@/core/context'
import { Validators } from '@/core/helper/Validators'

export default defineComponent({
  name: 'UserRegisterForm'
})
</script>