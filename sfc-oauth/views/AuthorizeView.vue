<template>
  <VCard
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
            :src="app?.icon"
            width="32px"
            height="32px"
            style="border-radius: 50%;"
            class="mr-2"
          > <span class="link">{{ app?.name }}</span>
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
        <VList v-if="allAuthorityList.length" class="mt-6 mb-6">
          <AuthorityListItem
            v-for="item in allAuthorityList"
            :key="item.code"
            class="authority-list-item"
            :item="item"
            show-checkbox
            :checked="existScopeSet.has(item.code) || selectedNewScopes.includes(item.code)"
            :disabled="existScopeSet.has(item.code)"
            @update:checked="toggleScope(item.code, $event)"
          />
        </VList>
      </VSheet>

      <!-- 授权按钮 -->
      <div class="d-flex justify-end">
        <VBtn
          color="primary"
          class="mt-2 pl-12 pr-12"
          @click="confirmAuthorize"
        >
          确认授权
        </VBtn>
      </div>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
/** 组件 props */
const props = defineProps<{
  /** 当前已登录的用户信息 */
  curUser: UserPrincipal
}>()

/** 发生不可恢复错误时，向父组件传递错误信息 */
const emit = defineEmits<{
  /** @param msg 错误信息 */
  (e: 'error', msg: string): void
  /** 用户确认授权时触发，携带表单提交所需的授权数据 */
  (e: 'confirm-authorize', data: { clientId: string, state: string, scopes: string[] }): void
}>()

const { msgList } = useMessage()
const lm = new LoadingManager()
const isLoading = lm.getLoadingRef()

/** 第三方应用信息 */
const app = ref<ThirdPartyApp>()
/** 本次请求的所有权限 scope 列表（含已授权+新请求） */
const allRequestScope = ref<string[]>([])
/** 已授权的权限 scope 集合 */
const existScopeSet = ref(new Set<string>())
/** 所有请求权限的详情列表（用于展示） */
const allAuthorityList = ref([]) as Ref<AuthorityItem[]>
/** 用户本次勾选的新授权 scope 列表 */
const selectedNewScopes = ref<string[]>([])

/** 当前页面 URL 参数 */
const curUrl = new URL(location.href)
const requireScope = curUrl.searchParams.get('scope')
const requireAppId = curUrl.searchParams.get('appId') || curUrl.searchParams.get('client_id')
const state = curUrl.searchParams.get('state') || ''

/** 带自动 loading 管理的 actions 代理 */
const actions = createAutoLoadingProxy({
  /**
   * 获取当前用户的授权信息和请求的应用信息，并提取本次需要新授权的权限
   */
  async getUserAuthentication() {
    const vo = (await request(oauth.getUserAuthorization(requireAppId as string))).data.data
    app.value = vo.thirdPartyApp
    // 提取已有授权中的 scope
    existScopeSet.value = new Set(vo.authorization?.scope?.split(' ').filter(e => e) || [])
    // 所有请求的 scope
    allRequestScope.value = requireScope?.split(' ').filter(e => e) || []
    // 本次新请求的权限默认勾选
    selectedNewScopes.value = allRequestScope.value.filter(e => !existScopeSet.value.has(e))
  },

  /**
   * 根据所有请求的 scope 获取详细权限信息列表，并将已授权的排到最后
   */
  async getAuthorityList() {
    const list = await getAuthorityList(allRequestScope.value.join(' '))
    // 已授权的权限排到最后显示
    allAuthorityList.value = [
      ...list.filter(e => !existScopeSet.value.has(e.code)),
      ...list.filter(e => existScopeSet.value.has(e.code))
    ]
  }
}, lm)

/**
 * 切换新权限的勾选状态
 * @param scope 权限 scope 代码
 * @param checked 是否勾选
 */
function toggleScope(scope: string, checked: boolean) {
  const idx = selectedNewScopes.value.indexOf(scope)
  if (checked && idx === -1) {
    selectedNewScopes.value.push(scope)
  } else if (!checked && idx !== -1) {
    selectedNewScopes.value.splice(idx, 1)
  }
}

/**
 * 确认授权，向父组件发送用户本次选择的新授权 scope 列表
 */
function confirmAuthorize() {
  emit('confirm-authorize', {
    clientId: requireAppId as string,
    state,
    scopes: selectedNewScopes.value
  })
}

onMounted(async() => {
  try {
    // 获取当前用户的授权信息和请求的应用信息
    await actions.getUserAuthentication()
    // 获取所有请求权限的详情
    await actions.getAuthorityList()

    // 计算本次需要新授权的 scope（排除已授权的）
    const newScopes = allRequestScope.value.filter(e => !existScopeSet.value.has(e))
    if (newScopes.length == 0) {
      // 无需新权限，直接确认授权
      confirmAuthorize()
    } else {
      // 检查是否存在无效权限
      const availableAuthorityCodeSet = new Set(allAuthorityList.value.map(e => e.code))
      const invalidAuthorityList = allRequestScope.value.filter(e => !availableAuthorityCodeSet.has(e))
      if (invalidAuthorityList.length > 0) {
        emit('error', `存在无效的请求权限：${invalidAuthorityList.join('、')}`)
      }
    }
  } catch (err) {
    emit('error', String(err))
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, ref, Ref, onMounted } from 'vue'
import { createAutoLoadingProxy, getAuthorityList, request, useMessage } from '../core'
import { UserPrincipal, ThirdPartyApp } from 'sfc-common'
import { LoadingManager } from 'sfc-common/utils/LoadingManager'
import LoadingMask from 'sfc-common/components/common/LoadingMask.vue'
import oauth from 'sfc-common/api/oauth'
import { AuthorityItem } from '../model'
import AuthorityListItem from '../components/AuthorityListItem.vue'

export default defineComponent({
  name: 'AuthorizeView',
  components: {
    LoadingMask,
    AuthorityListItem
  }
})
</script>
