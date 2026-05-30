<template>
  <VApp>
    <VAppBar app color="header">
      <VAppBarTitle>咸鱼云网盘 - 账号认证</VAppBarTitle>
      
      <UserAvatar :uid="curUser?.id || 0" :transition="false" />
      <span class="mr-3" style="font-size: 14px;">{{ curUser?.user || '[未登录]' }}</span>
    </VAppBar>
    <LoadingMask v-if="!isMounted" :loading="isLoading" :type="'circular'" />
    <VMain class="oauth-main" :class="{'bg-main-view': enabledBg, 'enabled-glass': enabledGlass, 'loaded': isMounted}">
      <div class="d-flex justify-center">
        <template v-if="errorMsg">
          <VCard
            title="系统出错"
            class="mt-12"
            width="calc(100% - 32px)"
            max-width="480px"
          >
            <VCardText>
              <VAlert type="error" variant="text">
                {{ errorMsg }}
              </VAlert>
            </VCardText>
          </VCard>
        </template>
        <template v-else>
          <!-- 登录视图 -->
          <LoginView v-if="isNeedLogin" @login-success="onLoginSuccess" />
          <!-- 设备授权成功视图 -->
          <DeviceSuccessView v-else-if="isDeviceSuccess" />
          <!-- 设备授权：有完整参数（user_code + scope + client_id），直接进入权限确认视图 -->
          <!-- 设备授权：缺少完整参数，显示用户码输入视图 -->
          <UserCodeView v-else-if="isDeviceFlow && !isDeviceAuthConfirm" @confirm="onUserCodeConfirm" />
          <!-- 授权确认视图（普通 OAuth 授权 或 设备授权确认） -->
          <AuthorizeView
            v-else-if="curUser"
            :cur-user="curUser"
            @error="errorMsg = $event"
            @confirm-authorize="onConfirmAuthorize"
          />
        </template>
      </div>
    </VMain>
  </VApp>
</template>

<script setup lang="ts">
const lm = new LoadingManager()
const isLoading = lm.getLoadingRef()
/** 当前已登录的用户信息，null 表示未登录 */
const curUser = ref() as Ref<UserPrincipal | null>
/** 是否需要先登录 */
const isNeedLogin = ref(false)
/** 页面是否已完成初始化挂载 */
const isMounted = ref(false)
/** 系统特性配置 */
const sysFeature = ref() as Ref<SystemFeature | null>
/** 全局错误信息，非空时展示错误卡片 */
const errorMsg = ref('')

const curUrl = new URL(location.href)
const requireScope = curUrl.searchParams.get('scope')
const requireAppId = curUrl.searchParams.get('appId') || curUrl.searchParams.get('client_id')
/** 当前 OAuth 授权类型，user_code 表示设备授权流程 */
const grantType = curUrl.searchParams.get('grant_type')
/** 设备授权流程中 URL 携带的用户码 */
const deviceUserCode = curUrl.searchParams.get('user_code')
/** 是否处于设备授权流程 */
const isDeviceFlow = ref(false)
/** 设备授权是否已成功（success=true） */
const isDeviceSuccess = ref(false)
/** 是否处于设备授权的权限确认阶段（URL 同时携带 user_code、scope、client_id） */
const isDeviceAuthConfirm = computed(() =>
  isDeviceFlow.value && !!deviceUserCode && !!requireScope && !!requireAppId
)

const enabledBg = computed(() => sysFeature.value?.bgMain?.enabled)
const bgUrl = computed(() => `url("${sysFeature.value?.bgMain?.url || ''}")`)
const bgOperacity = computed(() => `${sysFeature.value?.bgMain?.operacity || 0.9}`)
const bgSize = computed(() => `${sysFeature.value?.bgMain?.size || 'cover'}`)
const enabledGlass = computed(() => sysFeature.value?.bgMain?.enabledCardEffect || false)

/** 带自动 loading 管理的 actions 代理 */
const actions = createAutoLoadingProxy({
  /**
   * 获取当前登录用户信息
   */
  async getCurUser() {
    return curUser.value = await getCurUser()
  }
}, lm)

/**
 * 登录成功后的处理：
 * - 设备授权流程：刷新当前页面，使设备授权流程重新进入已登录状态
 * - 普通授权流程：重定向回 /oauth2/authorize，由 Spring AS 接管后续流程
 */
function onLoginSuccess() {
  if (isDeviceFlow.value) {
    location.reload()
  } else {
    location.replace('/oauth2/authorize?' + curUrl.searchParams.toString())
  }
}

/**
 * 用户确认输入用户码后的处理：跳转到设备验证页面
 * @param userCode 用户输入的用户码
 */
function onUserCodeConfirm(userCode: string) {
  location.href = '/oauth2/device_verification?user_code=' + encodeURIComponent(userCode)
}

/**
 * 用户确认授权后的处理：构造隐藏表单并 POST 提交
 * - 设备授权确认阶段：POST 到 /oauth2/device_verification，额外携带 user_code
 * - 普通 OAuth 授权：POST 到 /oauth2/authorize
 * @param data 授权表单数据，包含 clientId、state 和 scopes
 */
function onConfirmAuthorize(data: { clientId: string, state: string, scopes: string[] }) {
  const form = document.createElement('form')
  form.method = 'POST'
  // 根据流程类型决定提交目标
  form.action = isDeviceAuthConfirm.value ? '/oauth2/device_verification' : '/oauth2/authorize'

  // 辅助方法：添加 hidden input 字段
  const addField = (name: string, value: string) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  }

  addField('client_id', data.clientId)
  addField('state', data.state)
  // 逐个添加 scope 字段
  for (const scope of data.scopes) {
    addField('scope', scope)
  }
  // 设备授权确认阶段额外携带 user_code
  if (isDeviceAuthConfirm.value && deviceUserCode) {
    addField('user_code', deviceUserCode)
  }

  document.body.appendChild(form)
  lm.beginLoading()
  form.submit()
}

/**
 * 初始化：获取系统特性配置与当前用户信息，决定展示登录视图还是授权视图
 */
async function init() {
  isNeedLogin.value = false
  await Promise.all([
    // 首次挂载时获取系统特性
    isMounted.value ? Promise.resolve() : getSysFeature().then(e => sysFeature.value = e),
    actions.getCurUser()
  ])

  // 未登录 → 登录模式
  if (!curUser.value) {
    isNeedLogin.value = true
  }
}

onMounted(async() => {
  try {
    if (grantType === 'user_code') {
      // 设备授权流程：无需 client_id / scope 校验，直接初始化并判断登录状态
      isDeviceFlow.value = true
      // success=true 表示设备授权已完成，直接展示成功视图
      if (curUrl.searchParams.get('success') === 'true') {
        isDeviceSuccess.value = true
        getSysFeature().then(e => sysFeature.value = e)
        return
      }
      await init()
      return
    }
    // 普通授权流程：缺少必要 URL 参数时直接展示错误
    if (!requireAppId || !requireScope) {
      getSysFeature().then(e => sysFeature.value = e)
      errorMsg.value = '参数错误，缺少 client_id 或 scope'
      return
    }
    await init()
  } finally {
    isMounted.value = true
  }
})
</script>

<script lang="ts">

import 'sfc-common/styles/common.scss'
import { defineComponent, Ref, ref, onMounted, computed } from 'vue'
import { createAutoLoadingProxy, getCurUser, getSysFeature } from './core'
import { UserPrincipal, SystemFeature } from 'sfc-common'
import { LoadingManager } from 'sfc-common/utils/LoadingManager'
import LoadingMask from 'sfc-common/components/common/LoadingMask.vue'
import UserAvatar from './components/UserAvatar.vue'
import LoginView from './views/LoginView.vue'
import AuthorizeView from './views/AuthorizeView.vue'
import UserCodeView from './views/UserCodeView.vue'
import DeviceSuccessView from './views/DeviceSuccessView.vue'

export default defineComponent({
  name: 'App',
  components: {
    UserAvatar,
    LoginView,
    AuthorizeView,
    UserCodeView,
    DeviceSuccessView
  }
})
</script>

<style lang="scss" scoped> 
.oauth-main { 
  opacity: 0;
  filter: blur(30px);
  transition: all .5s;
  &.loaded {
    filter: unset;
    opacity: 1;
  }
}
.bg-main-view {
  position: relative;
  background-image: v-bind(bgUrl);
  background-size: v-bind(bgSize);
  background-attachment: fixed;


  &::before {
    content: '';
    position: fixed;
    background: rgba(var(--v-theme-background), v-bind(bgOperacity));
    z-index: 0;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
}
</style>
