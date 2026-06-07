<template>
  <VCard>
    <VCardTitle class="d-flex align-center">
      <VIcon class="mr-2">
        mdi-lan-connect
      </VIcon>
      PXE 网络启动服务
      <VSpacer />
    </VCardTitle>
    <VCardText>
      <VRow>
        <VCol cols="3">
          <div class="text-caption text-grey">
            TFTP 服务
          </div>
          <VChip :color="status?.tftpRunning ? 'success' : 'grey'" size="small">
            {{ status?.tftpRunning ? '运行中' : '已停止' }}
          </VChip>
          <div class="text-caption mt-1">
            端口: {{ status?.tftpPort || '-' }}
          </div>
        </VCol>
        <VCol cols="3">
          <div class="text-caption text-grey">
            HTTP 服务
          </div>
          <VChip :color="status?.httpRunning ? 'success' : 'grey'" size="small">
            {{ status?.httpRunning ? '运行中' : '已停止' }}
          </VChip>
          <div class="text-caption mt-1">
            端口: {{ status?.httpPort || '-' }}
          </div>
        </VCol>
        <VCol cols="3">
          <div class="text-caption text-grey">
            ProxyDHCP
          </div>
          <VChip :color="status?.proxyDhcpRunning ? 'success' : 'grey'" size="small">
            {{ status?.proxyDhcpRunning ? '运行中' : '未启用' }}
          </VChip>
        </VCol>
      </VRow>
      <VAlert
        v-if="status?.lastError"
        type="error"
        density="compact"
        class="mt-2"
      >
        {{ status.lastError }}
      </VAlert>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { PxeServiceStatus } from '../model'

/** PxeServiceStatusCard 组件的 Props 定义 */
interface Props {
  /** PXE 服务当前状态信息，为 null 表示尚未加载 */
  status?: PxeServiceStatus | null
  /** 服务启停按钮是否处于加载中状态 */
  toggling?: boolean
}

/** 使用默认值定义 Props */
withDefaults(defineProps<Props>(), {
  status: null,
  toggling: false
})
</script>
