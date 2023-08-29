<template>
  <VCard class="network-interface-info-card" :title="networkInterface.name">
    <VCardText>
      <div class="tip">
        <div>接口: {{ networkInterface.name }}</div>
        <div>名称: {{ networkInterface.displayName }}</div>
        <div>MAC: {{ networkInterface.mac }}</div>
        <div>
          IP地址:
          <ul style="padding-left: 24px;">
            <li v-for="ip in networkInterface.ipList" :key="ip">
              {{ ip }}
            </li>
          </ul>
        </div>
        <div>
          广播地址: 
          <ul style="padding-left: 24px;">
            <li v-for="ip in networkInterface.broadcastAddressList" :key="ip">
              {{ ip }}
            </li>
          </ul>
        </div>
        <div>MTU: {{ networkInterface.mtu }}</div>
      </div>
    </VCardText> 
  </VCard>
</template>

<script setup lang="ts">
const props = defineProps({
  networkInterface: {
    type: Object as PropType<NetworkInterfaceInfo>,
    default: () => ({})
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { NetworkInterfaceInfo } from '../model'

export default defineComponent({
  name: 'NetworkInterfaceInfoCard'
})
</script>

<style scoped lang="scss">
.network-interface-info-card {
  display: inline-block;
  margin: 0 6px 6px 0;
  max-width: 480px;
  width: 100%;
  min-width: 320px;
}
</style>