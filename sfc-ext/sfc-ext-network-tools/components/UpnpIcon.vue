<template>
  <template v-if="device">
    <CommonIcon
      v-if="!useDeviceIcon"
      size="30"
      :icon="getDeviceIcon(device)"
      :color="color"
    />
    <img
      v-if="deviceIconUrl"
      v-show="useDeviceIcon"
      :src="deviceIconUrl"
      width="30"
      @load="imgLoaded"
    >
  </template>
</template>

<script setup lang="ts">
const SfcUtils = window.SfcUtils
const props = defineProps({
  device: {
    type: Object as PropType<Upnp.UpnpDevice>,
    default: undefined
  },
  color: {
    type: String,
    default: undefined
  }
})

// 是否存在设备自身声明的图片
const deviceIconUrl = ref(undefined) as Ref<string | undefined>

// 是否使用设备自身声明的图片
const useDeviceIcon = ref(false)

function imgLoaded() {
  useDeviceIcon.value = true
}

onMounted(() => {
  const iconList = props.device?.describe.device.iconList
  if(iconList && iconList.length > 0) {
    // 筛选图标列表，有png优先找png的，接着找最大的
    const existPng = iconList.findIndex(icon => icon.mimetype?.includes('png')) != -1
    let maxSize = 0
    let iconIndex = 0
    iconList.forEach((icon, idx) => {
      if (existPng && !icon.mimetype?.includes('png')) {
        return
      }
      const size = icon.height * icon.width
      if (size > maxSize) {
        maxSize = size
        iconIndex = idx
      }
    })

    deviceIconUrl.value = SfcUtils.getApiUrl(NwtApi.UPnP.getUPnPIcon(props.device.describe.device.udn, iconIndex))
  }
})

/**
 * 获取设备图标
 */
function getDeviceIcon(device: Upnp.UpnpDevice) {
  const type = device.describe.device.deviceType
  if (type.startsWith('urn:schemas-upnp-org:device:InternetGatewayDevice')) {
    // 网络设备
    return 'mdi-router-network'
  } else if (type.startsWith('urn:schemas-upnp-org:device:MediaRenderer')) {
    // 媒体播放器
    return 'mdi-movie-play'
  } else if (type.startsWith('urn:schemas-upnp-org:device:MediaServer')) {
    // 媒体服务器
    return 'mdi-play-network'
  } else if (type.startsWith('urn:schemas-upnp-org:device:Printer')) {
    // 打印机
    return 'mdi-printer-outline'
  } else if (type.startsWith('urn:schemas-upnp-org:device:DigitalSecurityCamera') || type.startsWith('urn:schemas-upnp-org:device:IPCamera')) {
    // 摄像头
    return 'mdi-cctv'
  } else if (type.startsWith('urn:schemas-upnp-org:device:Scanner:1')) {
    // 扫描仪
    return 'mdi-scanner'
  } else {
    // 其他设备
    return 'mdi-network'
  }
}
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'
import { Upnp } from '../model'
import { NwtApi } from '../api'

export default defineComponent({
  name: 'UpnpIcon'
})
</script>