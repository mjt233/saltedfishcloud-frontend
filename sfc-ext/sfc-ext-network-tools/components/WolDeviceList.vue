<template>
  <div class="WolDeviceList">
    <VBtn
      v-if="showAdd"
      color="primary"
      style="margin-right: 12px"
      @click="addOrEditDevice()"
    >
      添加设备
    </VBtn>
    <VBtn @click="actions.loadData">
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
        :editable="editable"
        :loading="wakingDevice[device.id]"
        @wake="wake"
        @edit="addOrEditDevice($event)"
        @delete="batchDelete([$event])"
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
  },
  /**
   * 是否显示添加设备按钮
   */
  showAdd: {
    type: Boolean,
    default: true
  },
  /**
   * 存在唤醒中的设备时，是否自动刷新设备列表
   */
  autoRefresh: {
    type: Boolean,
    default: true
  },
  /**
   * 桌面组件配置信息
   */
  desktopComponentConfig: {
    type: Object as PropType<DesktopComponentConfig>,
    default: undefined
  },
  /**
   * 是否可编辑
   */
  editable: {
    type: Boolean,
    default: true
  }
})
const lm = new LoadingManager()
const loading = lm.getLoadingRef()
const deviceList = ref([]) as Ref<WolDevice[]>
const wakingDevice = reactive({} as {[idx:IdType]: boolean})
const loadDataNoLoading = async() => {
  deviceList.value = (await SfcUtils.request(NwtApi.Wol.findByUid(props.desktopComponentConfig?.uid || props.uid, true))).data.data || []
  deviceList.value.forEach(device => {
    if (device.isOnline) {
      wakingDevice[device.id] = false
    }
  })
}
const wake = async(dev: WolDevice) => {
  await SfcUtils.confirm(`确定要唤醒设备${dev.name}吗？`, '唤醒确认').then(() => actions.wake(dev))
}
const batchDelete = async(dev: WolDevice[]) => {
  const msg = `确定要删除 ${dev.length == 1 ? dev[0].name : dev.length + '个设备'} 吗？`
  await SfcUtils.confirm(msg, '删除确认')
  await actions.batchDelete(dev)
  SfcUtils.snackbar('删除成功')
  await actions.loadData()
}
const actions = MethodInterceptor.createAsyncActionProxy({
  async loadData() {
    await loadDataNoLoading()
  },
  async wake(dev: WolDevice) {
    await SfcUtils.request(NwtApi.Wol.wakeWolDevice(dev.id))
    wakingDevice[dev.id] = true
  },
  async batchDelete(dev: WolDevice[]) {
    await SfcUtils.request(NwtApi.Wol.batchDelete(dev.map(e => e.id)))
  }
}, false, lm)

const addOrEditDevice = (device?: WolDevice) => {
  const dialog = SfcUtils.openComponentDialog(WolDeviceForm, {
    title: device ? '编辑设备' : '添加设备',
    props: {
      initObject: device || {
        uid: props.desktopComponentConfig?.uid || props.uid
      },

    },
    extraDialogOptions: {
      persistent: true
    },
    async onConfirm() {
      const res = await dialog.getInstAsForm().submit()
      if (res.success) {
        SfcUtils.snackbar(device ? '保存成功' : '添加成功')
        actions.loadData()
        return true
      } else {
        return false
      }
      
    },
  })
}

actions.loadData()

let autoLoading = false
let autoRefreshItv = setInterval(async() => {
  if (!props.autoRefresh || autoLoading || !deviceList.value.find(e => wakingDevice[e.id])) {
    return
  }
  try {
    autoLoading = true
    await loadDataNoLoading()
  } finally {
    autoLoading = false
  }
}, 5000)

onUnmounted(() => {
  if (autoRefreshItv) {
    clearInterval(autoRefreshItv)
  }
})
</script>

<script lang="ts">
import { IdType, LoadingManager, MethodInterceptor, Components } from 'sfc-common'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { NwtApi } from '../api'
import { WolDevice } from '../model'
import WolDeviceCard from './WolDeviceCard.vue'
import WolDeviceForm from './WolDeviceForm.vue'
import { reactive } from 'vue'
import { onUnmounted } from 'vue'
import { DesktopComponentConfig } from 'sfc-common/model/Desktop'

export default defineComponent({
  name: 'WolDeviceList',
  components: {
    WolDeviceCard,
    LoadingMask: Components.LoadingMask
  }
})
</script>