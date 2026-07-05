<template>
  <VCard
    class="mt-12"
    width="calc(100% - 32px)"
    max-width="480px"
  >
    <VCardTitle>
      <VListItem title="请先登录" subtitle="授权第三方访问">
        <template #prepend>
          <UserAvatar :uid="0" style="margin: 0;" />
        </template>
      </VListItem>
      <VDivider class="mt-2" />
    </VCardTitle>

    <VCardText>
      <LoadingMask :loading="isLoading" />
      <VForm ref="loginFormRef">
        <VContainer>
          <VTextField
            v-model="username"
            variant="underlined"
            label="用户名/邮箱"
            color="primary"
            :rules="[Validators.notNull('用户名/邮箱不能为空')]"
          />
          <VTextField
            v-model="password"
            variant="underlined"
            label="密码"
            type="password"
            color="primary"
            :rules="[
              Validators.notNull('密码不能为空'),
              Validators.minLen('密码至少需要6位', 6)
            ]"
            @keyup.enter="doLogin"
          />
          <VBtn color="primary" @click="doLogin">
            登录
          </VBtn>
        </VContainer>

        <VAlert
          v-for="msg in msgList"
          :key="msg.id"
          class="mt-2"
          :text="msg.msg"
          :type="msg.type"
          variant="tonal"
          style="animation: up-in .2s;"
        />
      </VForm>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
/** 登录成功时触发，由父组件负责后续跳转 */
const emit = defineEmits<{
  (e: 'login-success'): void
}>()

/** 表单引用，用于触发表单验证 */
const loginFormRef = ref()
/** 用户名输入值 */
const username = ref('')
/** 密码输入值 */
const password = ref('')

const { msgList, addMsg } = useMessage()
const lm = new LoadingManager()
const isLoading = lm.getLoadingRef()

/** 带自动 loading 管理的 actions 代理 */
const actions = createAutoLoadingProxy({
  /**
   * 调用登录接口
   */
  async login() {
    return await login(username.value, password.value)
  }
}, lm)

/**
 * 执行登录操作，校验表单后调用登录接口，成功后重定向回 /oauth2/authorize
 */
async function doLogin() {
  // 防止重复提交
  if (isLoading.value) {
    return false
  }
  const validateRes: ValidateResult = await loginFormRef.value.validate()
  if (!validateRes.valid) {
    return
  }
  try {
    await actions.login()
    // 登录成功，通知父组件处理后续重定向
    emit('login-success')
  } catch (err) {
    if (err instanceof AxiosError) {
      const msg = err.response?.data?.msg
      if (msg) {
        addMsg(msg, 'error')
        return
      } else {
        // 判断是否为网络错误
        if (err.code === 'ERR_NETWORK') {
          addMsg('网络错误，请检查网络连接', 'error')
          return
        }
      }
    }
    addMsg('登录失败: ' + err, 'error')
  }
}
</script>

<script lang="ts">
import { defineComponent, defineEmits, ref } from 'vue'
import { createAutoLoadingProxy, login, useMessage } from '../core'
import { ValidateResult } from 'sfc-common'
import { Validators } from 'sfc-common/core/helper/Validators'
import { LoadingManager } from 'sfc-common/utils/LoadingManager'
import LoadingMask from 'sfc-common/components/common/LoadingMask.vue'
import UserAvatar from '../components/UserAvatar.vue'
import { AxiosError } from 'axios'

export default defineComponent({
  name: 'LoginView',
  components: {
    LoadingMask,
    UserAvatar
  }
})
</script>
