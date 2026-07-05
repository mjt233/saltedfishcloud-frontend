<template>
  <ConfigNodeGroupVue
    :items="items"
    @node-change="onNodeChange"
  />
</template>

<script setup lang="ts">
/**
 * 管理员配置页面中，用于渲染插件配置节点组的组件。
 * 封装了 ConfigNodeGroupVue，统一了样式和变更处理逻辑。
 */
import ConfigNodeGroupVue from 'sfc-common/components/common/ConfigNode/ConfigNodeGroup.vue'
import { ConfigNodeModel, NameValueType } from 'sfc-common/model'

defineProps<{
  /** 配置节点列表（插件配置组） */
  items: ConfigNodeModel[]
}>()

const emit = defineEmits<{
  /**
   * 节点值发生变更时触发
   * @param changeInfo 变更的节点名称与值
   */
  (e: 'change', changeInfo: NameValueType): void
}>()

/**
 * 处理 ConfigNodeGroupVue 的 nodeChange 事件，
 * 将变更信息透传至父组件处理。
 */
function onNodeChange(changeInfo: NameValueType) {
  emit('change', changeInfo)
}
</script>
