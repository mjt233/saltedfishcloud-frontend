<template>
  <v-img
    :src="imgUrl"
    style="display: inline-block"
    :transition="false"
  >
    <template #placeholder>
      <v-img :src="commonUrl" :transition="false" />
    </template>
  </v-img>
</template>

<script setup lang="ts">
const commonUrl = computed(() => {
  return props.isDir ? iconProvider.getDirIconUrl(props.fileName) : iconProvider.getFileIconUrl(props.fileName, props.md5)
})

const thumbnailUrl = computed(() => {
  return StringUtils.appendPath(API.getDefaultPrefix(), API.resource.getThumbnail(props.md5, type.value).url)
})

const type = computed(() => {
  return props.fileName.split('.').pop() || ''
})

const imgUrl = computed(() => {
  let url = ''
  if (props.useThumb && props.md5 && context.feature.value.thumbType.includes(type.value)) {
    url = thumbnailUrl.value
  } else {
    url = commonUrl.value
  }
  return url
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
import API from '@/api'
import { StringUtils } from '@/utils/StringUtils'

export default defineComponent({
  name: 'FileIcon'
})
</script>

<style scoped>
.v-img__img--preload {
  filter: none !important;
}

</style>