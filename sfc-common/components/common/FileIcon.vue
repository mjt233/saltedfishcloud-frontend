<template>
  <div :style="containerStyle" style="position: relative">
    <v-img
      :src="imgUrl"
      style="display: inline-block;width: 100%;"
      :style="{ height: computedHeight }"
      :transition="false"
      draggable="false"
      class="file-icon-img"
      cover
      @mousedown.prevent
      @error="loadError"
    >
      <template #placeholder>
        <v-img
          draggable="false"
          :src="commonUrl"
          :transition="false" 
          :height="computedHeight"
          cover
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
    type: [Number, String],
    default: undefined
  },
  width: {
    type: [Number, String],
    default: undefined
  }
})

// 判断字符串是否包含CSS单位
const hasUnit = (value: string): boolean => {
  const unitRegex = /^[\d.]+\s*(px|em|rem|%|vh|vw|pt|cm|mm|in|pc|ex|ch|vmin|vmax)$/i
  return unitRegex.test(value.trim())
}

// 计算 height 的值，如果是数字则添加 'px'，如果是字符串且无单位则添加 'px'
const computedHeight = computed(() => {
  if (!props.height) return ''
  if (typeof props.height === 'string') {
    return hasUnit(props.height) ? props.height : `${props.height}px`
  }
  return `${props.height}px`
})

// 计算 width 的值，如果是数字则添加 'px'，如果是字符串且无单位则添加 'px'
const computedWidth = computed(() => {
  if (!props.width) return '100%'
  if (typeof props.width === 'string') {
    return hasUnit(props.width) ? props.width : `${props.width}px`
  }
  return `${props.width}px`
})

// 容器样式
const containerStyle = computed(() => ({
  width: computedWidth.value,
  height: computedHeight.value
}))

const isError = ref(false)
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
  return getContext().feature.value.thumbType.findIndex(e => e.toLocaleLowerCase() == type.toLocaleLowerCase()) != -1
}

const loadError = () => {
  isError.value = true
}

const imgUrl = computed(() => {
  let url = ''
  if (isError.value) {
    url = commonUrl.value
  } else if (props.useThumb && (props.md5 || props.customThumbnailUrl) && isSupportType(type.value)) {
    url = thumbnailUrl.value
  } else {
    url = commonUrl.value
  }
  return url
})
</script>

<script lang="ts">
import { computed, defineComponent, defineProps, onMounted, PropType, ref } from 'vue'
import iconProvider from 'sfc-common/core/serivce/FileIconProvider'
import { getContext } from 'sfc-common/core/context'
import API from 'sfc-common/api'
import { StringUtils } from 'sfc-common/utils/StringUtils'

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