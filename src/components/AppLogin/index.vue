<template>
  <v-card
    style="overflow: hidden;"
    :disabled="loading"
    color="background"
  >
    <v-progress-linear v-if="loading" indeterminate color="primary" />
    <!-- 头部 -->
    <v-list-item>

      <!-- 头像 -->
      <v-list-item-avatar>
        <v-img :src="avatar" />
      </v-list-item-avatar>

      <!-- 标题 -->
      <div style="margin: 8px 16px;">
        <v-list-item-title class="headline">
          登录账号
        </v-list-item-title>
        <v-list-item-subtitle>开启云存储之旅</v-list-item-subtitle>
      </div>
    </v-list-item>

    <!-- 表单 -->
    <v-card-content>
      <v-form ref="form">
        <v-row>
          <v-col :xs="8">
            <v-text-field
              v-model="username"
              color="primary"
              :label="'用户名'"
              variant="underlined"
              autocapitalize="false"
              :rules="[rules.nonNull]"
            />
          </v-col>
          <v-col :lg="3" class="text-body-2" align-self="center">
            <div>
              <a href="javascript:;" tabindex="-1" class="text-primary">去注册</a>
            </div>
          
          </v-col>
        </v-row>
        <v-row>
          <v-col :xs="8">
            <v-text-field
              v-model="password"
              color="primary"
              :label="'密码'"
              variant="underlined"
              type="password"
              :rules="[rules.nonNull, rules.validLen]"
              @keyup.enter="doLogin"
            />
          </v-col>
          <v-col :lg="3" class="text-body-2" align-self="center">
            <div>
              <a href="javascript:;" tabindex="-1" class="text-primary">忘记密码?</a>
            </div>
          </v-col>
        </v-row>
      </v-form>
      <v-btn color="primary" @click="doLogin">
        登录
      </v-btn>
    </v-card-content>
  </v-card>
  <v-snackbar v-model="showSnack" :timeout="3000">
    {{ snackText }}
    <template #actions>
      <v-btn
        variant="text"
        color="error"
        style="font-weight: bold;"
        @click="showSnack = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
const form = ref()
const rules = {
  nonNull: (e: string) => !!e || '不能为空',
  validLen: (e: string) => e.length >= 6 || '密码不能小于6位'
}
const username = ref('')
const password = ref('')

const avatar = context.defaultAvatar
const showSnack = ref(false)
const snackText = ref('')
const loading = ref(false)

const emit = defineEmits(['success', 'failed'])

const doLogin = async(_event: KeyboardEvent | MouseEvent) => {
  loading.value = true
  const loginConf = API.user.login(username.value, password.value)
  const session = context.session.value
  try {
    const validRes: ValidateResult = await form.value.validate()
    if (!validRes.valid) {
      return new Error('表单校验不通过')
    }

    // 登录
    // 设置token
    const loginRet = await axios(loginConf)
    session.setToken(loginRet.data.data)
    
    // 获取用户信息
    const userInfoRet = await axios(API.user.getUserInfo())
    session.setUserInfo(userInfoRet.data.data)

    emit('success', context.session.value.user)
  } catch(err) {
    const msg = (err as any).toString()
    emit('failed', msg)
    SfcUtils.snackbar(msg, 5000)
  } finally {
    loading.value = false
  }
}
</script>

<script lang="ts">
import API from '@/api'
import { context, ValidateResult } from '@/core/context'
import axios from '@/plugins/axios'
import SfcUtils from '@/utils/SfcUtils'
import { defineComponent, reactive, ref, toRefs } from 'vue'

export default defineComponent({
  name: 'AppLogin'
})
</script>