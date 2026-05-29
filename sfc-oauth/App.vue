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
          <!-- 登录框 -->
          <VCard
            v-if="isNeedLogin"
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
          <VCard
            v-else-if="state"
            class="mt-12"
            width="calc(100% - 32px)"
            max-width="640px"
          >
            <VCardTitle>
              第三方应用授权
            </VCardTitle>
            <VCardText>
              <LoadingMask :loading="isLoading" />
              <div class="d-flex align-center text-body-1">
                您（{{ curUser?.user }}）将授权第三方应用
                <span class="d-inline-flex align-center ml-2 mr-2">
                  <img
                    :src="app.icon"
                    width="32px"
                    height="32px"
                    style="border-radius: 50%;"
                    class="mr-2"
                  > <span class="link">{{ app.name }}</span>
                </span>
                以下权限
              </div>

              
              <VAlert
                v-for="msg in msgList"
                :key="msg.id"
                class="mt-2"
                :text="msg.msg"
                :type="msg.type"
                variant="tonal"
                style="animation: up-in .2s;"
              />
              <!-- 展示请求的权限列表 -->
              <VSheet elevation="2">
                <VList v-if="requireAuthorityList.length" class="mt-6 mb-6">
                  <AuthorityListItem
                    v-for="item in requireAuthorityList"
                    :key="item.code"
                    class="authority-list-item"
                    :item="item"
                  />
                </VList>
              </VSheet>

              <!-- 授权操作说明 -->

              <!-- 授权按钮 -->
              <div class="d-flex justify-end">
                <VBtn
                  color="primary"
                  class="mt-2 pl-12 pr-12"
                  @click="actions.confirmAuthorize"
                >
                  确认授权
                </VBtn>
              </div>
            </VCardText>
          </VCard>
        </template>
      </div>
    </VMain>
  </VApp>
</template>

<script setup lang="ts">
const props = defineProps({})
const { msgList, addMsg } = useMessage()
const lm = new LoadingManager()
const isLoading = lm.getLoadingRef()
const curUser = ref() as Ref<UserPrincipal | null>
const isNeedLogin = ref(false)
const username = ref('')
const password = ref('')
const app = ref() as Ref<ThirdPartyApp>
const actions = createAutoLoadingProxy({
  async getCurUser() {
    return curUser.value = await getCurUser()
  },
  async login() {
    return await login(username.value, password.value)
  },
  /**
   * 获取当前用户的授权信息和请求的应用信息，并提取本次需要新授权的权限
   */
  async getUserAuthentication() {
    const vo = (await request(oauth.getUserAuthorization(requireAppId as string))).data.data
    app.value = vo.thirdPartyApp
    const existAuthorities = new Set(vo.authorization?.scope?.split(' ').filter(e => e) || [])
    requireNewScope.value = requireScope?.split(' ').filter(e => !existAuthorities.has(e)) || []
  },
  async getAuthorityList() {
    requireAuthorityList.value = await getAuthorityList(requireNewScope.value.join(' '))
  },

  /**
   * 确认授权，通过表单 POST 到 /oauth2/authorize
   */
  async confirmAuthorize() {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/oauth2/authorize'

    const addField = (name: string, value: string) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = name
      input.value = value
      form.appendChild(input)
    }

    addField('client_id', requireAppId as string)
    addField('state', state)
    for (const scope of requireNewScope.value) {
      addField('scope', scope)
    }

    document.body.appendChild(form)
    lm.beginLoading()
    form.submit()
  }
}, lm)

const isMounted = ref(false)
const loginFormRef = ref()
const sysFeature = ref() as Ref<SystemFeature | null>
const curUrl = new URL(location.href)
const errorMsg = ref('')
const requireScope = curUrl.searchParams.get('scope')
const requireAppId = curUrl.searchParams.get('appId') || curUrl.searchParams.get('client_id')
const state = curUrl.searchParams.get('state') || ''
// 需要新授权的权限
const requireNewScope = ref([]) as Ref<string[]>
const requireAuthorityList = ref([]) as Ref<AuthorityItem[]>

  
const enabledBg = computed(() => sysFeature.value?.bgMain?.enabled)
const bgUrl = computed(() => `url("${sysFeature.value?.bgMain?.url || ''}")`)
const bgOperacity = computed(() => `${sysFeature.value?.bgMain?.operacity || 0.9}`)
const menuOperacity = computed(() => `${Number(bgOperacity.value) + 0.04}` )
const bgSize = computed(() => `${sysFeature.value?.bgMain?.size || 'cover'}`)
const enabledGlass = computed(() => sysFeature.value?.bgMain?.enabledCardEffect || false)

async function doLogin() {
  if (isLoading.value) {
    return false
  }
  const validateRes: ValidateResult = await loginFormRef.value.validate()
  if (!validateRes.valid) {
    return
  }
  try {
    await actions.login()
    // 登录成功后重定向回 /oauth2/authorize，由 Spring AS 接管后续流程
    location.replace('/oauth2/authorize?' + curUrl.searchParams.toString())
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

async function init() {
  // 初始化，获取系统特性参数和判断当前用户是否已登录
  isNeedLogin.value = false
  await Promise.all([
    isMounted.value ? Promise.resolve() : getSysFeature().then(e => sysFeature.value = e),
    actions.getCurUser()
  ])

  // 未登录 → 登录模式
  if (!curUser.value) {
    isNeedLogin.value = true
    return
  }

  // 已登录 → 授权模式，获取应用信息并展示权限列表
  // state 由 Spring AS 在 consent 重定向时生成，此时必然存在
  actions.getUserAuthentication()
    .then(() => {
      if (requireNewScope.value.length == 0) {
        // 无需新权限，直接确认
        actions.confirmAuthorize()
      } else {
        // 展示权限列表
        actions.getAuthorityList()
          .then(() => {
            const availableAuthorityCodeSet = new Set(requireAuthorityList.value.map(e => e.code))
            const invalidAuthorityList = requireNewScope.value.filter(e => !availableAuthorityCodeSet.has(e))
            if (invalidAuthorityList.length > 0) {
              errorMsg.value = `存在无效的请求权限：${invalidAuthorityList.join('、')}`
            }
          })
      }
    })
    .catch(err => {
      errorMsg.value = err
    })
}

onMounted(async() => {
  try {
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
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, reactive, computed } from 'vue'
import { createAutoLoadingProxy, getAuthorityList, getCurUser, getSysFeature, login, request, useMessage } from './core'
import { IdType, UserPrincipal, SystemFeature, ThirdPartyApp, ThirdPartyAppUserAuthorizationVo, ValidateResult } from 'sfc-common'
import { Validators } from 'sfc-common/core/helper/Validators'
import { LoadingManager } from 'sfc-common/utils/LoadingManager'
import LoadingMask from 'sfc-common/components/common/LoadingMask.vue'
import UserAvatar from './components/UserAvatar.vue'
import { AxiosError } from 'axios'
import oauth from 'sfc-common/api/oauth'
import { AuthorityItem } from './model'
import AuthorityListItem from './components/AuthorityListItem.vue'
import { log } from 'node:console'

export default defineComponent({
  name: 'App',
  components: {
    UserAvatar
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
