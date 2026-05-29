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
          <!-- 授权视图 -->
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
 * 登录成功后的处理：重定向回 /oauth2/authorize，由 Spring AS 接管后续流程
 */
function onLoginSuccess() {
  location.replace('/oauth2/authorize?' + curUrl.searchParams.toString())
}

/**
 * 用户确认授权后的处理：构造隐藏表单并 POST 到 /oauth2/authorize
 * @param data 授权表单数据，包含 clientId、state 和 scopes
 */
function onConfirmAuthorize(data: { clientId: string, state: string, scopes: string[] }) {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = '/oauth2/authorize'

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
    // 缺少必要 URL 参数时直接展示错误
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

export default defineComponent({
  name: 'App',
  components: {
    UserAvatar,
    LoginView,
    AuthorizeView
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
