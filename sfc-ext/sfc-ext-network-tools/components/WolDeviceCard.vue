<template>
  <VCard class="wol-device-card">
    <LoadingMask :loading="loading" type="circular" />
    <VCardContent>
      <div class="d-flex justify-space-between">
        <div>
          <CommonIcon icon="mdi-laptop" :color="wolDevice.isOnline ? 'primary' : ''" style="font-size: 32px" />
        </div>
        <div class="tip" style="width: calc(100% - 12px);margin-left: 12px;">
          <div>设备名: {{ wolDevice.name }}</div>
          <div>MAC: {{ wolDevice.mac }}</div>
          <div>IP: {{ wolDevice.ip }}</div>
        </div>
        <div>
          <VBtn
            v-if="!wolDevice.isOnline"
            style="margin-top: 6px;"
            icon="mdi-power"
            color="primary"
            @click="emits('wake', wolDevice)"
          />
        </div>
      </div>
    </VCardContent>
  </VCard>
</template>

<script setup lang="ts">
const props = defineProps({
  wolDevice: {
    type: Object as PropType<WolDevice>,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits<{
  (e: 'wake', data: WolDevice): void
}>()

</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { WolDevice } from '../model'

export default defineComponent({
  name: 'WolDeviceCard',
})
</script>

<style scoped lang="scss">
.wol-device-card {
  display: inline-block;
  width: 100%;
  max-width: 320px;
  min-width: 280px;
  margin-right: 6px;
}

@media (max-width: 640px) {
  .wol-device-card {
    max-width: 100%;
  }
}
</style>