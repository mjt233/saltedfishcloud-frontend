<template>
  <div>
    <VBtn color="primary" @click="loadingActions.loadUPnpList">
      <CommonIcon icon="mdi-refresh" />
      刷新
    </VBtn>
    <div class="mt-3">
      <LoadingMask :loading="isLoading" />
      <VCard
        v-for="dev in devices"
        :key="dev.describe.device.udn"
        class="mb-2"
      >
        <VCardTitle color="primary" :title="dev.describe.device.friendlyName" class="d-flex">
          <UpnpIcon :device="dev" color="primary" />
          <span class="ml-2">{{ dev.describe.device.friendlyName }}</span>
        </VCardTitle>
        <VCardText>
          <VRow>
            <VCol>
              <p>设备型号名称: {{ dev.describe.device.modelName }}</p>
              <p v-if="dev.describe.device.modelURL">
                设备型号页面: <a target="_blank" class="link" :href="dev.describe.device.modelURL">{{ dev.describe.device.modelURL }}</a>
              </p>
              <p>厂商: {{ dev.describe.device.manufacturer }}</p>
              <p>厂商主页: <a target="_blank" class="link" :href="dev.describe.device.manufacturerURL">{{ dev.describe.device.manufacturerURL }}</a></p>
            </VCol>
            <VCol>
              <p>设备地址: {{ getIP(dev.location) }}</p>
              <p :title="dev.describe.device.deviceType">
                设备类型: {{ dev.describe.device.deviceType.split(':')[3] }}
              </p>
              <p v-if="dev.describe.device.presentationURL">
                管理页面: <a target="_blank" class="link" :href="dev.describe.device.presentationURL">{{ dev.describe.device.presentationURL }}</a>
              </p>
            </VCol>
          </VRow>
          <VDivider />
          <div class="mt-2">
            包含服务:
            <VChip
              v-for="service in getServiceList(dev)"
              :key="service.serviceId"
              color="primary"
              :title="service.serviceType"
              class="mr-2"
            >
              {{ service.serviceType.split(':')[3] }}
            </VChip>
          </div>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const SfcUtils = window.SfcUtils
const props = defineProps({})
let devices = ref([]) as Ref<Upnp.UpnpDevice[]>
const actions = {
  async loadUPnpList() {
    const devList = (await SfcUtils.request(NwtApi.UPnP.listUPnP())).data.data
    devices.value = devList
    return devList
  }
}
const lm = new LoadingManager()
const isLoading = lm.getLoadingRef()
const loadingActions = MethodInterceptor.createAsyncActionProxy(actions, true, lm)

/**
 * 从设备描述URL中获取设备IP地址
 * @param url 设备描述Location URL
 */
function getIP(url: string) {
  const u = new URL(url)
  return u.host
}

/**
 * 获取UPnP设备支持的服务
 * @param rootDevice 根设备
 */
function getServiceList(rootDevice: Upnp.UpnpDevice) {
  const devs = [rootDevice.describe.device] as Upnp.Device[]
  const services = [] as Upnp.Service[]
  while (devs.length > 0) {
    const dev = devs.pop()
    dev?.serviceList?.forEach(s => services.push(s))
    dev?.deviceList?.forEach(d => devs.push(d))
  }
  return services
}


onMounted(() => {
  loadingActions.loadUPnpList()
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'
import { NwtApi } from '../api'
import { Upnp } from '../model/'
import { LoadingManager, MethodInterceptor } from 'sfc-common'
import UpnpIcon from './UpnpIcon.vue'

export default defineComponent({
  name: 'UpnpInfoCard'
})
</script>

<style>

</style>