<template>
  <!-- 根据文件类型渲染对应的预览组件 -->
  <component
    :is="previewComponent"
    v-if="previewComponent"
    :item="item"
    :drawer-visible="drawerVisible"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropType, Component } from 'vue'
import type { InvalidDataRecord } from '../../model'
import AudioPreviewer from './AudioPreviewer.vue'
import VideoPreviewer from './VideoPreviewer.vue'
import ImagePreviewer from './ImagePreviewer.vue'
import TextPreviewer from './TextPreviewer.vue'

/** 文件类型到预览组件的映射 */
const previewerMap: Record<string, Component> = {
  audio: AudioPreviewer,
  video: VideoPreviewer,
  image: ImagePreviewer,
  text: TextPreviewer
}

/** 支持预览的文件类型列表 */
const previewableTypes = Object.keys(previewerMap)

/** 组件属性 */
const props = defineProps({
  /**
   * 要预览的失效数据记录
   */
  item: {
    type: Object as PropType<InvalidDataRecord>,
    required: true
  },
  /**
   * 抽屉是否可见，用于在抽屉关闭时暂停媒体播放
   */
  drawerVisible: {
    type: Boolean,
    default: true
  }
})

/**
 * 根据当前记录的文件类型返回对应的预览组件
 * 若文件类型不支持预览则返回 null
 */
const previewComponent = computed<Component | null>(() => {
  const fileType = props.item.fileType
  if (!fileType || !previewableTypes.includes(fileType)) return null
  return previewerMap[fileType]
})
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'InvalidDataPreviewer'
})
</script>
