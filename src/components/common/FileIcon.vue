<template>
  <v-img
    :src="url"
    style="display: inline-block"
    :transition="false"
  />
</template>

<script setup lang="ts">
const url = computed(() => {
  return props.isDir ? iconProvider.getDirIconUrl(props.fileName) : iconProvider.getFileIconUrl(props.fileName, props.md5)
})
const props = defineProps({
  useThumb: {
    type: Boolean,
    default: true
  },
  fileName: {
    type: String,
    default: ''
  },
  md5: {
    type: String,
    default: ''
  },
  isDir: {
    type: Boolean,
    default: false
  }
})
</script>

<script lang="ts">
import { computed, defineComponent, defineProps, onMounted, PropType, ref } from 'vue'
import { FileInfo } from '@/core/model'
import iconProvider from '@/core/serivce/FileIconProvider'
import { context } from '@/core/context'

export default defineComponent({
  name: 'FileIcon'
})
</script>