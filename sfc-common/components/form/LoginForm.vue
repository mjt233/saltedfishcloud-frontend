<template>
  <v-card
    style="overflow: hidden;"
    :disabled="loading"
    color="background"
  >
    <v-progress-linear v-if="loading" indeterminate color="primary" />
    <!-- 头部 -->
    <v-list-item :prepend-avatar="avatar">

      <!-- 标题 -->
      <div style="margin: 8px 0">
        <v-list-item-title class="headline">
          登录账号
        </v-list-item-title>
        <v-list-item-subtitle>开启云存储之旅</v-list-item-subtitle>
      </div>
    </v-list-item>

    <!-- 表单 -->
    <v-card-text>
      <base-form ref="form" :submit-action="doLogin" :model-value="formData">
        <v-row>
          <v-col :xs="8">
            <v-text-field
              v-model="formData.username"
              color="primary"
              :label="'用户名'"
              variant="underlined"
              autocapitalize="false"
              :rules="[Validators.notNull('用户名不能为空')]"
            />
          </v-col>
          <v-col
            v-if="!plain"
            style="max-width: 120px"
            class="text-body-2"
            align-self="center"
          >
            <div>
              <router-link
                to="/register"
                href="javascript:;"
                tabindex="-1"
                class="text-primary link"
              >
                去注册
              </router-link>
            </div>
          
          </v-col>
        </v-row>
        <v-row>
          <v-col :xs="8">
            <v-text-field
              v-model="formData.password"
              color="primary"
              :label="'密码'"
              variant="underlined"
              type="password"
              :rules="[Validators.notNull('密码不能为空'), Validators.minLen('密码至少需要6位', 6)]"
              @keyup.enter="emit('submit')"
            />
          </v-col>
          <v-col
            v-if="!plain"
            style="max-width: 120px"
            class="text-body-2"
            align-self="center"
          >
            <div>
              <router-link
                to="/forget"
                href="javascript:;"
                tabindex="-1"
                class="text-primary link"
              >
                忘记密码？
              </router-link>
            </div>
          </v-col>
        </v-row>
      </base-form>
      <v-btn
        v-if="showLogin"
        style="margin-top: 14px"
        color="primary"
        @click="emit('submit')"
      >
        登录
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { deconstructForm } from 'sfc-common/utils/FormUtils'
const form = ref()
const formData = reactive({
  username: '',
  password: ''
})

const avatar = context.defaultAvatar
const loading = ref(false)
const props = defineProps({
  /**
   * 是否只显示登录输入组件
   */
  plain: {
    type: Boolean,
    default: false
  },
  showLogin: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['submit'])

const doLogin = async(_event: KeyboardEvent | MouseEvent) => {
  loading.value = true
  const loginConf = API.user.login(formData.username, formData.password)
  const session = context.session.value
  try {
    // 登录
    // 设置token
    const loginRet = await axios(loginConf)
    session.setToken(loginRet.data.data)
    
    // 获取用户信息
    const userInfoRet = await axios(API.user.getUserInfo())
    session.setUserInfo(userInfoRet.data.data)
  } finally {
    loading.value = false
  }
}

defineExpose(deconstructForm(form))
</script>

<script lang="ts">
import API from 'sfc-common/api'
import { Validators } from 'sfc-common/core/helper/Validators'
import { context, ValidateResult } from 'sfc-common/core/context'
import axios from 'sfc-common/plugins/axios'
import { defineComponent, reactive, ref, toRefs } from 'vue'

export default defineComponent({
  name: 'LoginForm'
})
</script>