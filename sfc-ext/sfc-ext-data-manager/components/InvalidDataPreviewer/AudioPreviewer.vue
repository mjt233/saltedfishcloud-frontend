<template>
  <div class="pa-4">
    <audio
      controls
      :src="downloadUrl"
      style="width: 100%"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import { DataManagerAPI } from '../../api'
import type { InvalidDataRecord } from '../../model'

const SfcUtils = window.SfcUtils

/** 组件属性 */
const props = defineProps({
  /**
   * 要预览的失效数据记录
   */
  item: {
    type: Object as PropType<InvalidDataRecord>,
    required: true
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
