<template>
  <div class="image-previewer" :class="{'hid': hid}">
    <v-icon
      v-ripple
      class="close-btn"
      icon="mdi-close"
      @click="toClose"
    />
    <div ref="barRef" class="bar">
      <grid-container :type="'evenly'" :width="180" style="width: 100%;margin-top: 20px">
        <div
          v-for="(file, index) in fileList"
          ref="barItemsRef"
          :key="file.name"
          class="bar-item"
          :class="{'active': index == activeIdx}"
          @click="selectImage(index)"
        >
          <div class="bar-img-container">
            <file-icon
              class="bar-img"
              :md5="file.md5"
              :file-name="file.name"
              :dir="false"
              :show-thumb="true"
            />
          </div>
          <div class="bar-title text-truncate">
            {{ file.name }}
          </div>
        </div>
      </grid-container>
    </div>
    <div class="image-container">
      <loading-mask :loading="loading" />
      <!-- 图片本体 -->
      <v-img v-if="showMainImg" class="main-img" :src="imgSrc">
        <template #placeholder>
          <loading-mask :loading="true" :type="'circular'" />
        </template>
      </v-img>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingMask from '../LoadingMask.vue'
import FileIcon from '../FileIcon.vue'
import GridContainer from '@/components/layout/GridContainer.vue'
const loading = ref(false)
const activeIdx = ref(0)
const showMainImg = ref(true)
const props = defineProps({
  fileList: {
    type: Array as PropType<FileInfo[]>,
    default: () => []
  },
  imageIndex: {
    type: Number,
    default: 0
  }
})

const selectImage = (idx: number) => {
  activeIdx.value = idx
  emits('update:imageIndex', idx)
}

const imgSrc = computed(() => {
  const targetFile = props.fileList[activeIdx.value]
  return StringUtils.appendPath(API.getDefaultPrefix(), API.resource.downloadFileByMD5(targetFile.md5, targetFile.name).url)
})

watch(imgSrc, async() => {
  showMainImg.value = false
  await nextTick()
  showMainImg.value = true
  updateBarScrollTop()
})

const emits = defineEmits(['close', 'update:imageIndex'])

const hid = ref(false)
const toClose = () => {
  window.removeEventListener('keydown', escHandler)
  hid.value = true
  setTimeout(() => {
    emits('close')  
  }, 120)
  
}
const barItemsRef = ref() as Ref<HTMLElement[]>
const barRef = ref() as Ref<HTMLElement>


const updateBarScrollTop = () => {
  const thumb = barItemsRef.value[activeIdx.value]
  const bar = barRef.value
  bar.scrollTop = thumb.offsetTop - (bar.clientHeight / 2 - thumb.clientHeight)
}

const escHandler = (e: KeyboardEvent) => {
  if (e.key == 'Escape') {
    toClose()
  }
}
onMounted(() => {
  window.addEventListener('keydown', escHandler)
  activeIdx.value = props.imageIndex
})

watch(() => props.imageIndex, () => {
  if (props.imageIndex != activeIdx.value) {
    selectImage(props.imageIndex)
  }
})
</script>

<script lang="ts">
import { FileInfo } from '@/core/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { StringUtils } from '@/utils/StringUtils'
import API from '@/api'

export default defineComponent({
  name: 'ImagePreviewer'
})
</script>

<style lang="scss" scoped>
.close-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 21px;
  border-radius: 50%;
  z-index: 114514;
  text-shadow: 0px 0px 6px black;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.image-previewer {
  display: flex;
  background-color: rgba(37, 37, 37, .95);
  color: white;
  animation: fade-in .2s;
  transition: all .1s;

  &.hid {
    opacity: 0;
  }

  .bar {
    display: flex;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 0 16px;
    min-width: 180px;
    font-size: 12px;
    height: 100%;
    scroll-behavior:smooth;
    overflow: auto;
    &::-webkit-scrollbar-track {
      background: rgb(0, 0, 0);
    }
    .bar-item {
      display: flex;
      flex-direction: column;
      height: 114px;
      margin: 3px 18px;
      align-items: center;
    }
    .bar-title {
      width: 100%;
      opacity: .8;
      height: 28px;
      transition: all .1s;
    }

    .bar-img-container {
      width: 100%;
      height: 80%;
      display: flex;
      border: 4px rgb(173, 173, 173) solid;
      transition: all .1s;
      cursor: pointer;
    }
    .bar-item.active,.bar-item:hover {
      .bar-img-container {
        border-color: rgb(var(--v-theme-primary));
      }
      .bar-title {
        color: rgb(var(--v-theme-primary));
      }
    }
  }

  .image-container {
    width: 100%;
    height: 100%;
    
    .main-img {
      width: 100%;
      height: 100%;
    }
  }
}
</style>