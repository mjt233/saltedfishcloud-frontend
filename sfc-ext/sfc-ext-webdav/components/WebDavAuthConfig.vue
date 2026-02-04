<template>
  <VCard class="webdav-auth-config pa-4">
    <VCardText>
      
      <VRow>
        <VCol cols="12">
          <p class="text-h6 mb-4 d-flex align-center">
            <VIcon icon="mdi-lock" class="mr-2" />WebDAV 密码配置
          </p>
        </VCol>
      </VRow>
      
      <VRow>
        <VCol cols="12">
          <VAlert type="info" variant="tonal" class="mb-2">
            <div class="text-body-2">
              由于WebDAV基于Digest的算法与主账号系统的算法不一致，且系统出于安全原因并未记录主账号的原始密码，
              因此WebDAV的密码需要单独设置。
            </div>
          </VAlert>
        </VCol>
      </VRow>
      
      <VRow>
        <VCol cols="12">
          <VChip
            variant="elevated"
            :color="loading ? undefined : isAuthSet ? 'success' : 'warning'" 
            :prepend-icon="loading ? undefined : isAuthSet ? 'mdi-check-circle' : 'mdi-alert'"
            size="large"
            class="px-6 py-2 mr-6 mb-2"
          >
            <template v-if="loading">
              <VProgressCircular
                indeterminate
                color="primary"
                size="20"
                class="mr-2"
              />
              检测中...
            </template>
            <template v-else>
              {{ isAuthSet ? '已设置密码' : '未设置密码' }}
            </template>
          </VChip>
          <!-- <br> -->
          <VBtn 
            v-if="!loading"
            :variant="isAuthSet ? 'tonal' : 'elevated'" 
            class="px-11 mb-2"
            :color="isAuthSet ? 'warning' : 'success'" 
            flat
            @click="setPassword"
          >
            {{ isAuthSet ? '重置密码' : '设置密码' }}
          </VBtn>
        </VCol>
      </VRow>
      
      <VRow>
        <VCol cols="12">
          <p class="text-h6 mb-4 d-flex align-center">
            <VIcon icon="mdi-server" class="mr-2" />WebDAV 服务信息
          </p>
        </VCol>
      </VRow>
      
      <VRow class="mb-6">
        <VCol md="4" sm="6" cols="12">
          <VCard 
            variant="elevated"
            class="pa-4 d-flex flex-column align-center justify-center elevation-2"
            height="120"
          >
            <div class="d-flex align-center mb-2">
              <VAvatar color="primary" size="40" class="mr-3">
                <VIcon icon="mdi-power-plug" size="24" />
              </VAvatar>
              <span class="text-body-1 font-weight-medium">服务器状态</span>
            </div>
            <VChip
              :color="serverConfig.isEnable ? 'success' : 'error'" 
              size="default"
              variant="elevated"
            >
              {{ serverConfig.isEnable ? '启用' : '停用' }}
            </VChip>
          </VCard>
        </VCol>
        
        <VCol md="4" sm="6" cols="12">
          <VCard 
            variant="elevated"
            class="pa-4 d-flex flex-column align-center justify-center elevation-2"
            height="120"
          >
            <div class="d-flex align-center mb-2">
              <VAvatar color="indigo" size="40" class="mr-3">
                <VIcon icon="mdi-network" size="24" />
              </VAvatar>
              <span class="text-body-1 font-weight-medium">服务端口</span>
            </div>
            <VChip color="info" variant="elevated">
              {{ serverConfig.serverPort || 8086 }}
            </VChip>
          </VCard>
        </VCol>
        
        <VCol md="4" sm="6" cols="12">
          <VCard 
            variant="elevated"
            class="pa-4 d-flex flex-column align-center justify-center elevation-2"
            height="120"
          >
            <div class="d-flex align-center mb-2">
              <VAvatar color="orange" size="40" class="mr-3">
                <VIcon icon="mdi-account-key" size="24" />
              </VAvatar>
              <span class="text-body-1 font-weight-medium">匿名访问</span>
            </div>
            <VChip
              :color="serverConfig.isAllowAnonymous ? 'success' : 'warning'" 
              size="default"
              variant="elevated"
            >
              {{ serverConfig.isAllowAnonymous ? '允许' : '不允许' }}
            </VChip>
          </VCard>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { WebDavApi } from '../webDavApi'
import { getContext, IdType, LoadingManager, MethodInterceptor } from 'sfc-common'
import WebDavAuthConfigForm from './WebDavAuthConfigForm.vue'
import { WebDavServerConfig } from '../model'

const props = defineProps<{
  uid: IdType
}>()

const lm = new LoadingManager()
const loading = lm.getLoadingRef()

const actions = MethodInterceptor.createAsyncActionProxy({
  async getStatus() {
    const response = await window.SfcUtils.request(WebDavApi.getWebDavAuthStatus(props.uid))
    isAuthSet.value = response.data.data
    const f = (await window.SfcUtils.request(window.API.sys.getFeature())).data
    serverConfig.value = f.webDavConfig
  }
}, true, lm)

// 响应式数据
const isAuthSet = ref(false)
const serverConfig = ref(getContext().feature.value.webDavConfig as WebDavServerConfig)

function setPassword() {
  const inst = window.SfcUtils.openComponentDialog(WebDavAuthConfigForm, {
    props: {
      uid: props.uid
    },
    title: isAuthSet.value ? '重置WebDAV密码' : '设置WebDAV密码',
    persistent: true,
    async onConfirm() {
      const form = inst.getInstAsForm()
      const r = await form.validate()
      if (!r.valid) {
        const msgs = new Set(r.errors.map(e => e.errorMessages.toString()))
        window.SfcUtils.snackbar(Array.from(msgs).join(';'))
        return false
      }
      inst.beginLoading()
      try {
        const submitRes = await form.submit()
        if(!submitRes.success) {
          return false
        }
        window.SfcUtils.snackbar('密码设置成功')
        actions.getStatus()
        return true
      } finally {
        inst.closeLoading()
      }
    }
  })
}

onMounted(() => {
  actions.getStatus()
})
</script>

<style scoped>
.link {
  cursor: pointer;
  color: #1976d2;
  text-decoration: underline;
}
</style>
