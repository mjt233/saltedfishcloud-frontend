<template>
  <VCard class="wol-device-card">
    <LoadingMask :loading="loading" type="circular" />
    <VCardText>
      <div class="d-flex justify-space-between">
        <div>
          <CommonIcon icon="mdi-laptop" :color="wolDevice.isOnline ? 'primary' : ''" style="font-size: 32px" />
        </div>
        <div class="tip" style="width: calc(100% - 12px);margin-left: 12px;">
          <div class="d-flex align-center">
            设备名: {{ wolDevice.name }}
            <CommonIcon
              v-if="editable"
              class="link d-flex align-center"
              style="font-size: 10px;margin-left: 6px"
              icon="mdi-pencil"
              @click="emits('edit', wolDevice)"
            />
            <CommonIcon
              v-if="editable"
              class="link d-flex align-center text-error"
              style="font-size: 10px;margin-left: 6px;--main-color: var(--v-theme-error)"
              icon="mdi-close"
              @click="emits('delete', wolDevice)"
            />
          </div>
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
    </VCardText>
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
  },
  editable: {
    type: Boolean,
    default: true
  }
})
const emits = defineEmits<{
  /** 点击唤醒 */
  (e: 'wake', data: WolDevice): void,
  /** 点击编辑 */
  (e: 'edit', data: WolDevice): void,
  /** 点击删除 */
  (e: 'delete', data: WolDevice): void
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
  max-width: 420px;
  min-width: 280px;
  margin-right: 6px;
  margin-bottom: 6px;
}

@media (max-width: 720px) {
  .wol-device-card {
    max-width: 100%;
  }
}
</style>