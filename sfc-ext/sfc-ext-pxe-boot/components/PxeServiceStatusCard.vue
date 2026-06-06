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
        <VCol cols="3">
          <div class="text-caption text-grey">
            活跃会话
          </div>
          <div class="text-h6">
            {{ status?.activeSessions || 0 }}
          </div>
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

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { PxeServiceStatus } from '../model'

export default defineComponent({
  name: 'PxeServiceStatusCard',
  props: {
    /**
     * PXE 服务当前状态信息，为 null 表示尚未加载
     */
    status: {
      type: Object as PropType<PxeServiceStatus | null>,
      default: null
    },
    /**
     * 服务启停按钮是否处于加载中状态
     */
    toggling: {
      type: Boolean,
      default: false
    }
  }
})
</script>
