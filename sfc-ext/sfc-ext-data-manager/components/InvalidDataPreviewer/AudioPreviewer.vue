<template>
  <div class="pa-4">
    <audio
      ref="mediaRef"
      controls
      :src="downloadUrl"
      style="width: 100%"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { PropType } from 'vue'
import { DataManagerAPI } from '../../api'
import type { InvalidDataRecord } from '../../model'

const SfcUtils = window.SfcUtils

/** audio 元素引用 */
const mediaRef = ref<HTMLAudioElement>()

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
   * 抽屉是否可见，关闭时暂停播放
   */
  drawerVisible: {
    type: Boolean,
    default: true
  }
})

/** 抽屉关闭时自动暂停音频播放 */
watch(() => props.drawerVisible, (visible) => {
  if (!visible) {
    mediaRef.value?.pause()
  }
})

/** 文件下载地址 */
const downloadUrl = computed(() => SfcUtils.getApiUrl(DataManagerAPI.download(props.item.id)))
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AudioPreviewer'
})
</script>
