<template>
  <div class="WolDeviceList">
    <VBtn color="primary" @click="addDevice">
      添加设备
    </VBtn>
    <VBtn style="margin-left: 12px" @click="actions.loadData">
      <CommonIcon icon="mdi-refresh" />
      刷新
    </VBtn>
    <LoadingMask :loading="loading" />
    <div style="margin-top: 12px;">
      <WolDeviceCard
        v-for="device in deviceList"
        :key="device.id"
        style="animation: up-in .2s"
        :wol-device="device"
        :loading="wakingDevice[device.id]"
        @wake="actions.wake"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const SfcUtils = window.SfcUtils
const props = defineProps({
  uid: {
    type: [String, Number] as PropType<IdType>,
    default: 0
  }
})
const lm = new LoadingManager()
const loading = lm.getLoadingRef()
const deviceList = ref([]) as Ref<WolDevice[]>
const wakingDevice = reactive({} as {[idx:IdType]: boolean})
const actions = MethodInterceptor.createAsyncActionProxy({
  async loadData() {
    deviceList.value = (await SfcUtils.request(NwtApi.Wol.findByUid(props.uid))).data.data || []
  },
  async wake(dev: WolDevice) {
    await SfcUtils.request(NwtApi.Wol.wakeWolDevice(dev.id))
    wakingDevice[dev.id] = true
    
  }
}, false, lm)

const addDevice = () => {
  const dialog = SfcUtils.openComponentDialog(WolDeviceForm, {
    title: '添加设备',
    props: {
      initObject: {
        uid: props.uid
      }
    },
    async onConfirm() {
      const res = await dialog.getInstAsForm().submit()
      if (res.success) {
        SfcUtils.snackbar('添加成功')
        actions.loadData()
        return true
      } else {
        return false
      }
      
    },
  })
}

const showDevice = (device: WolDevice) => {
  const dialog = SfcUtils.openComponentDialog(WolDeviceForm, {
    showConfirm: false,
    props: {
      wolDevice: device,
      readOnly: true
    }
  })
}

actions.loadData()
</script>

<script lang="ts">
import { IdType, LoadingManager, MethodInterceptor, Components } from 'sfc-common'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { NwtApi } from '../api'
import { WolDevice } from '../model'
import WolDeviceCard from './WolDeviceCard.vue'
import WolDeviceForm from './WolDeviceForm.vue'
import { reactive } from 'vue'

export default defineComponent({
  name: 'WolDeviceList',
  components: {
    WolDeviceCard,
    LoadingMask: Components.LoadingMask
  }
})
</script>