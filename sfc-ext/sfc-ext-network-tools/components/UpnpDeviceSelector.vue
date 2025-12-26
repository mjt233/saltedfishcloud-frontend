<template>
  <div class="upnp-device-selector">
    <VProgressLinear v-if="autoRefresh" indeterminate color="primary" />
    
    <div class="mt-4">
      <div
        v-for="dev in deviceList"
        :key="dev.describe.device.udn"
        v-ripple
        class="d-flex align-center upnp-device-selector-item"
        @click="emits('select', dev)"
      >
        <UpnpIcon :device="dev" color="primary" />
        <span class="ml-2 tip">{{ dev.describe.device.friendlyName }}</span>
      </div>
    </div>
    <div v-if="autoRefresh" class="tip ml-2 text-center">
      正在搜索服务器网络中的多媒体播放设备...
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  deviceType: {
    type: Array as PropType<string[]>,
    default: undefined
  },
  autoRefresh: {
    type: Boolean,
    default: true
  }
})
const emits = defineEmits<{
  (e: 'select', v: Upnp.UpnpDevice): void
}>()
const deviceList = ref([]) as Ref<Upnp.UpnpDevice[]>
const methods = {
  async loadList() {
    const l = (await window.SfcUtils.request(NwtApi.UPnP.listUPnP())).data.data.filter(d => {
      if (!props.deviceType) {
        return true
      }
      return props.deviceType.includes(d.describe.device.deviceType)
    })
    deviceList.value = l
    return deviceList.value
  }
}
let itv: any
let isAutoLoading = false
onMounted(() => {
  methods.loadList()
  itv = setInterval(async() => {
    if (isAutoLoading) {
      return
    }
    isAutoLoading = true
    try {
      await methods.loadList()
    } finally {
      isAutoLoading = false
    }
  }, 2000)
})
onUnmounted(() => {
  if (itv) {
    clearInterval(itv)
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, watch, onUnmounted } from 'vue'
import { NwtApi } from '../api'
import { Upnp } from '../model/'
import UpnpIcon from './UpnpIcon.vue'

export default defineComponent({
  name: 'UpnpDeviceSelector'
})
</script>

<style lang="scss" scoped>
  .upnp-device-selector-item {
    padding: 6px 3px;
    cursor: pointer;
    transition: background-color .2s;
    animation: fade-in .2s;
    &:hover {
      background-color: rgb(var(--v-theme-primary), .1);
    }
    & + & {
      border-top: 1px solid rgb(var(--v-theme-primary), .1);
    }
  }
</style>