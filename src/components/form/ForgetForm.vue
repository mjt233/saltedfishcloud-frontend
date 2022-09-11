<template>
  <base-form ref="form" :model-value="formData" :submit-action="actions.reset">
    <loading-mask :loading="loading" />
    <v-window v-model="step">
      <v-window-item :value="0">
        <div style="padding: 16px">
          <text-input
            ref="accountRef"
            v-model="formData.account"
            label="要找回的用户名或邮箱"
            :rules="validators.account"
            @keypress.enter="nextStep(1)"
          />
          <v-btn color="primary" style="width: 100%" @click="nextStep(1)">
            下一步
          </v-btn>
        </div>
      </v-window-item>
      <v-window-item :value="1">
        <div style="padding: 16px">
          <v-row>
            <v-col>
              <text-input
                v-model="formData.code"
                label="请输入验证码"
                :rules="validators.validCode"
              />
            </v-col>
            <v-col style="max-width: 120px;min-width: 120px;">
              <timeout-btn ref="sendBtnRef" unique-key="forgetEmail" @click="resendCode">
                重新发送
              </timeout-btn>
            </v-col>
          </v-row>
          <v-btn color="primary" style="width: 100%" @click="nextStep(2)">
            验证
          </v-btn>
        </div>
      </v-window-item>
      <v-window-item :value="2">
        <div style="padding: 16px">
        
          <text-input
            v-model="formData.password"
            label="请输入新密码"
            type="password"
            :rules="validators.password"
          />
          <text-input
            ref="confirmRef"
            v-model="formData.confirmPassword"
            label="请输入确认密码"
            type="password"
            :rules="validators.confirmPassword"
            @keypress.enter="emits('submit')"
          />
          <v-btn color="primary" style="width: 100%" @click="emits('submit')">
            重置
          </v-btn>
        </div>
      </v-window-item>
    </v-window>
  </base-form>
</template>

<script setup lang="ts">
import BaseForm from '../common/BaseForm.vue'
import { CommonForm, deconstructForm } from '@/utils/FormUtils'
import TextInput from '../common/TextInput.vue'
import { Validators } from '@/core/helper/Validators'
import SfcUtils from '@/utils/SfcUtils'
import TimeoutBtn from '../common/btn/TimeoutBtn.vue'
import API from '@/api'
import { TimeoutBtnModel } from '@/core/model/component/TimeoutBtnModel'
import LoadingMask from '../common/LoadingMask.vue'
import { LoadingManager } from '@/utils/LoadingManager'
import { MethodInterceptor } from '@/utils/MethodInterceptor'
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()
const accountRef = ref() as Ref<CommonForm & ComponentPublicInstance>
const sendBtnRef = ref() as Ref<TimeoutBtnModel>
const confirmRef = ref() as Ref<ComponentPublicInstance>
const form = ref()
const step = ref(0)
const formData = reactive({
  account: '',
  code: '',
  password: '',
  confirmPassword: ''
})
const validators = reactive({
  account: [Validators.notNull('账号不能为空')],
  validCode: [Validators.notNull('验证码不能为空')],
  password: [Validators.notNull('密码不能为空'), Validators.minLen('密码不能小于6位', 6)],
  confirmPassword: [
    (e: string) => {
      if (e != formData.password) {
        return '确认密码与密码不一致'
      } else {
        return true
      }
    }
  ]
})
const emits = defineEmits(['submit'])
const resendCode = async(doLoad: Function) => {
  await actions.sendCode()
  doLoad()
}
const actions = MethodInterceptor.createAutoCatch(
  MethodInterceptor.createAutoLoadingProxy({
    /**
     * 发送验证码
     */
    async sendCode() {
      return await SfcUtils.request(API.user.sendResetPasswordEmail(formData.account))
    },
    /**
     * 验证验证码
     */
    async validCode() {
      const ret = await SfcUtils.request(API.user.validResetPasswordEmailCode(formData.account, formData.code))
      if (!ret.data.data) {
        return Promise.reject('验证码不正确')
      }
    },
    /**
     * 执行重置密码（最终表单提交动作）
     */
    async reset() {
      (confirmRef.value.$el.querySelector('input') as HTMLInputElement).blur()
      await SfcUtils.request(API.user.resetPassword(formData.account, formData.code, formData.password))
    }
  }, loadingManager)
  , true)


const nextStep = async(nextStepNum: number) => {
  if (nextStepNum == 1) {
    const result = await accountRef.value.validate()
    if (!result.valid) {
      SfcUtils.snackbar(result.errors.map(e => e.errorMessages).join(';'))
      return
    }
    // 1. 取消焦点，防止在对话框存在期间通过回车继续触发
    (accountRef.value.$el.querySelector('input') as HTMLInputElement).blur()

    // 2. 用户确认
    await SfcUtils.confirm(`即将向该账号"${formData.account}"绑定的邮箱发送验证邮件，是否继续？`, '提示')

    // 3. 发送验证码，并进入下一步
    await actions.sendCode()
    step.value++

    // 4. 开始等待再次发送
    await nextTick()
    sendBtnRef.value.startWait()
  }

  if (nextStepNum == 2) {
    await actions.validCode()
    step.value++
  }
}
const formInst = deconstructForm(form)
defineExpose(formInst)
</script>

<script lang="ts">
import { ComponentPublicInstance, defineComponent, defineEmits, nextTick, reactive, Ref, ref } from 'vue'
import { context } from '@/core/context'

export default defineComponent({
  name: 'ForgetForm'
})
</script>