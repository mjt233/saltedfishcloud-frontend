<template>
  <div :style="{width: width ? width + 'px' : '100%'}" style="position: relative">
    <v-img
      :src="imgUrl"
      style="display: inline-block;width: 100%;"
      :transition="false"
      draggable="false"
      class="file-icon-img"
      @mousedown.prevent
    >
      <template #placeholder>
        <v-img
          draggable="false"
          :src="commonUrl"
          :transition="false" 
          @mousedown.prevent
        />
      </template>
    </v-img>
    <common-icon v-if="cornerIcon" class="corner-icon" :icon="cornerIcon" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  /**
   * 是否使用文件缩略图
   */
  useThumb: {
    type: Boolean,
    default: true
  },
  /**
   * 文件名称
   */
  fileName: {
    type: String,
    default: ''
  },
  /**
   * 文件md5
   */
  md5: {
    type: String,
    default: ''
  },
  /**
   * 是否为目录
   */
  isDir: {
    type: Boolean,
    default: false
  },
  /**
   * 自定义缩略图url
   */
  customThumbnailUrl: {
    type: String,
    default: undefined
  },
  cornerIcon: {
    type: String,
    default: undefined
  },
  height: {
    type: [Number,String],
    default: undefined
  },
  width: {
    type: [Number,String],
    default: undefined
  }
})
const commonUrl = computed(() => {
  return props.isDir ? iconProvider.getDirIconUrl(props.fileName) : iconProvider.getFileIconUrl(props.fileName, props.md5)
})

const thumbnailUrl = computed(() => {
  const url = props.customThumbnailUrl || StringUtils.appendPath(API.getDefaultPrefix(), API.resource.getThumbnail(props.md5, type.value).url)
  return url
})

const type = computed(() => {
  return props.fileName.split('.').pop() || ''
})

const isSupportType = (type: string) => {
  return context.feature.value.thumbType.findIndex(e => e.toLocaleLowerCase() == type.toLocaleLowerCase()) != -1
}


const imgUrl = computed(() => {
  let url = ''
  if (props.useThumb && (props.md5 || props.customThumbnailUrl) && isSupportType(type.value)) {
    url = thumbnailUrl.value
  } else {
    url = commonUrl.value
  }
  return url
})
</script>

<script lang="ts">
import { computed, defineComponent, defineProps, onMounted, PropType, ref } from 'vue'
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
.file-icon-img {
  width: 32px;
}

.corner-icon {
  position: absolute;
  bottom: 3px;
  left: -3px;
  font-size: 8px;
  color: rgb(var(--v-theme-primary));
  transform: rotateZ(-45deg);
}
</style>