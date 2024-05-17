<template>
  <div>
    <LoadingMask :loading="loading" />
    <div style="display: flex;flex-wrap: wrap;">
      <NetworkInterfaceInfoCard
        v-for="ni in dataList"
        :key="ni.name"
        style="animation: up-in .2s"
        :network-interface="ni"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const SfcUtils = window.SfcUtils
const lm = new LoadingManager()
const loading = lm.getLoadingRef()
const dataList = ref([]) as Ref<NetworkInterfaceInfo[]>
const actions = MethodInterceptor.createAsyncActionProxy({
  async loadData() {
    dataList.value = (await SfcUtils.request(NwtApi.getAllInterface())).data.data
  }
}, false, lm)

actions.loadData()
</script>

<script lang="ts">
import { LoadingManager, MethodInterceptor } from 'sfc-common'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { NetworkInterfaceInfo } from '../model'
import { NwtApi } from '../api'
import NetworkInterfaceInfoCard from './NetworkInterfaceInfoCard.vue'

export default defineComponent({
  name: 'NetworkInterfaceList',
  components: { NetworkInterfaceInfoCard }
})
</script>