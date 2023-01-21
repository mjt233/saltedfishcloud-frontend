<template>
  <div style="margin-top: 12px">
    <LoadingMask :loading="loading" />
    <GridContainer :width="360">
      <PluginInfoCard
        v-for="item in pluginList"
        :key="item.name"
        :plugin-info="item"
        :read-only="false"
        @delete="actions.deletePlugin"
      />
    </GridContainer>
  </div>
</template>

<script setup lang="ts">
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()
const pluginList = ref([]) as Ref<PluginInfo[]>

const actions = MethodInterceptor.createAsyncActionProxy({
  async loadList() {
    pluginList.value = (await SfcUtils.request(API.plugin.listAvailablePlugins())).data.data
    return pluginList.value
  },
  async deletePlugin(plugin: PluginInfo) {
    await SfcUtils.request(API.plugin.deletePlugin(plugin.name))
    SfcUtils.snackbar('删除成功')
    await actions.loadList()
  }
}, false, loadingManager)

onMounted(actions.loadList)
</script>

<script lang="ts">
import API from '@/api'
import { PluginInfo } from '@/core/model'
import { LoadingManager } from '@/utils/LoadingManager'
import { MethodInterceptor } from '@/utils/MethodInterceptor'
import SfcUtils from '@/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'

export default defineComponent({
  name: 'PluginManager'
})
</script>
