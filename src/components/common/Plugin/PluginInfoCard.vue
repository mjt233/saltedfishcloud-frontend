<template>
  <VCard class="plugin-item">
    <VCardHeader>
      <VCardTitle>
        <div class="d-flex align-center ">
          <CommonIcon color="primary" style="margin-right: 9px" :icon="pluginInfo.icon || 'mdi-puzzle'" />
          <span>{{ pluginInfo.alias || pluginInfo.name }}</span>
          <div class="tip">
            ({{ pluginInfo.name }})
          </div>
        </div>
      </VCardTitle>
    </VCardHeader>
    <VCardContent style="padding-top: 0px;padding-bottom: 0px;">
      <div>
        描述: {{ pluginInfo.describe || '-' }}
      </div>
      <div v-if="!readOnly" style="margin-bottom: 6px;">
        状态: <span :class="statusTextClass[pluginInfo.status] || 'text-success'">{{ statusDict[pluginInfo.status] || '未知' }}</span>
      </div>
      <div class="tip">
        <!-- 基础信息 -->
        <div>插件版本: {{ pluginInfo.version }}</div>
        <div>API版本: {{ pluginInfo.apiVersion }}</div>
        <div>开发者: {{ pluginInfo.author }}</div>
        <div>email: {{ pluginInfo.email }}</div>

        <!-- 模块信息 -->
        <VDivider style="margin: 3px 0" />
        <div>类型: {{ pluginInfo.name == 'sys' ? '核心内置' : pluginInfo.isJar ? 'Jar包' : '目录挂载' }}</div>
        <div v-if="pluginInfo.url" class="d-flex">
          <div style="width: 72px">
            路径: 
          </div>
          <div class="break-text">
            {{ pluginInfo.url }}
          </div>
        </div>
      </div>
    </VCardContent>
    <VCardActions v-if="!readOnly && pluginInfo.isJar && pluginInfo.status != 2" class="justify-end">
      <VBtn color="error" @click="deleteConfirm">
        <div class="d-flex align-center">
          <VIcon icon="mdi-delete" color="error" />
          删除
        </div>
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
const statusDict = {
  0: '未加载',
  1: '已加载',
  2: '待删除，已加载'
}
const statusTextClass = {
  0: 'text-info',
  1: 'text-success',
  2: 'text-error'
}
const props = defineProps({
  pluginInfo: {
    type: Object as PropType<PluginInfo>,
    default() { return {} }
  },
  readOnly: {
    type: Boolean,
    default: true
  }
})
const emits = defineEmits(['delete'])
const deleteConfirm = async() => {
  await SfcUtils.confirm('确定要删除该插件吗？', '删除确认')
  emits('delete', props.pluginInfo)
}
</script>

<script lang="ts">
import { PluginInfo } from '@/core/model'
import SfcUtils from '@/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'PluginInfoCard'
})
</script>



<style scoped lang="scss">
.plugin-item {
  display: inline-block;
  max-width: 360px;
}
</style>