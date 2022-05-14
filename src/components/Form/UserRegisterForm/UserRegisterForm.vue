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
      <v-form ref="extraForm">
        <v-window v-model="regType" style="padding-top: 8px;top: -8px; position:relative">
          <v-window-item value="regCode">
            <text-input v-model="extraFormData.regCode" :rules="extraRules.regCode" label="邀请码" />
          </v-window-item>
          <v-window-item value="email">
            <v-row>
              <v-col>
                <text-input v-model="extraFormData.email" :rules="extraRules.email" label="邮箱" />
              </v-col>
              <v-col md="auto">
                <div style="width: 120px" class="d-flex justify-center">
                  <v-btn color="surface">
                    获取验证码
                  </v-btn>
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
      </v-form>
      <v-btn color="primary" width="100%" @click="emit('submit')">
        立即注册
      </v-btn>
    </v-card-content>
    
  </v-card>
</template>

<script setup lang="ts">
import BaseRegisterForm from './BaseRegisterForm.vue'
import TextInput from '@/components/Common/TextInput.vue'
import { defineForm, DefineForm } from '@/utils/FormUtils'
import SfcUtils from '@/utils/SfcUtils'
import API from '@/api'
import LoadingMask from '@/components/Common/LoadingMask.vue'
const avatar = context.defaultAvatar.value
const baseForm = ref()
const extraForm = ref()
const regType = ref('regCode')
const loading = ref(false)
const extraFormData = reactive({
  regCode: '',
  email: '',
  emailCode: ''
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

const emit = defineEmits(['submit'])
defineExpose(defineForm({
  formData: extraFormData,
  formRef: extraForm,
  sonForm: [ baseForm ],
  async submitExecutor() {
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
}))
const emitSubmit = () => {
  console.log(123)
}
</script>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from 'vue'
import { context } from '@/core/context'
import { Validators } from '@/core/helper/Validators'

export default defineComponent({
  name: 'UserRegisterForm'
})
</script>