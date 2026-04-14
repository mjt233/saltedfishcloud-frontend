<template>
  <div class="image-viewer" :class="{'hid': hid, 'fullscreen-mode': isFullscreen}">
    <!-- 背景区域，点击空白处关闭 -->
    <div class="image-viewer-bg" @click="toClose" />

    <!-- 右上角叉叉和全屏按钮 -->
    <div class="top-right-tools">
      <v-btn
        icon="mdi-fullscreen"
        variant="text"
        color="white"
        class="mr-2"
        @click.stop="toggleFullscreen"
      />
      <v-btn
        icon="mdi-close"
        variant="text"
        color="white"
        @click.stop="toClose"
      />
    </div>

    <!-- 主图预览区 -->
    <div
      ref="imgContainerRef"
      class="image-container"
      @wheel.prevent="mouseScrollHandler"
      @mousedown.prevent="mouseDownHandler"
      @mousemove="mousemoveHandler"
      @mouseup.prevent="mouseUpHandler"
      @mouseleave="mouseUpHandler"
      @touchstart="touchStartHandler"
      @touchmove.prevent="touchMoveHandler"
      @touchend="touchEndHandler"
      @dblclick="zoomManager.handleDoubleClick"
    >
      <loading-mask :loading="loading" />

      <!-- 主图 -->
      <v-img
        v-if="showMainImg"
        ref="imgRef"
        class="main-img"
        :class="{'no-transition': noTransition}"
        :src="imgSrc"
        draggable="false"
        @load="imgLoadHandler"
      >
        <template #placeholder>
          <loading-mask :loading="true" :type="'circular'" />
        </template>
      </v-img>
    </div>

    <!-- 底部控制栏和图片列表 -->
    <div class="bottom-area" :class="{'hide-list': isFullscreen}">
      <!-- 工具栏 -->
      <div class="image-tool-bar">
        <div class="image-switch">
          <!-- 上一张 -->
          <v-btn
            icon="mdi-chevron-left"
            variant="text"
            color="white"
            @click.stop="switchImage(-1)"
          />
          
          <span class="image-info">{{ activeIdx + 1 }} / {{ fileList.length }}  |  {{ zoomManager.scaleSize.value.toFixed(0) }}%</span>
          
          <!-- 下一张 -->
          <v-btn
            icon="mdi-chevron-right"
            variant="text"
            color="white"
            @click.stop="switchImage(1)"
          />
        </div>
      </div>

      <!-- 预览缩略图列表 (使用虚拟滚动或普通横向滚动以支持大量数据) -->
      <div ref="barRef" class="thumbnail-list-container">
        <!-- 此处使用水平居中或者水平滑动条 -->
        <div class="thumbnail-list">
          <div
            v-for="(file, index) in fileList"
            :key="file.md5 + '_' + index"
            ref="barItemsRef"
            class="thumbnail-item"
            :class="{'active': index === activeIdx}"
            @click="selectImage(index)"
          >
            <file-icon
              class="thumb-img"
              :md5="file.md5"
              :file-name="file.name"
              :dir="false"
              :show-thumb="true"
              :custom-thumbnail-url="thumbnailUrlGenerator && thumbnailUrlGenerator(file)"
            />
            <div class="thumb-title text-truncate">
              {{ file.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted, Ref } from 'vue'
import LoadingMask from '../LoadingMask.vue'
import FileIcon from '../FileIcon.vue'
import { VImg } from 'vuetify/components'
import { imageViewerProps, imageViewerEmits, ImageViewerExpose } from './imageViewerParams'
import { useZoomManager } from './composables/useZoomManager'
import { useDragManager } from './composables/useDragManager'
import { useImageSelection } from './composables/useImageSelection'
import { useKeyboardManager } from './composables/useKeyboardManager'

const props = defineProps(imageViewerProps)
const emits = defineEmits(imageViewerEmits)

const hid = ref(false)
const loading = ref(false)
const isFullscreen = ref(false)

const imgContainerRef = ref<HTMLElement>()
const imgRef = ref<any>()
const barRef = ref<HTMLElement>()
const barItemsRef = ref<HTMLElement[]>([])

const showPosition = reactive({ top: '0px', left: '0px' })

const zoomManager = useZoomManager(imgContainerRef, imgRef, showPosition)
const selectionManager = useImageSelection(props, emits, zoomManager)
const { activeIdx, showMainImg, selectImage, switchImage, imgSrc } = selectionManager

const dragManager = useDragManager(showPosition, emits, (delta) => switchImage(delta))
const { noTransition, mouseDownHandler, mousemoveHandler, mouseUpHandler, touchStartHandler, touchMoveHandler, touchEndHandler } = dragManager

useKeyboardManager(() => toClose(), switchImage)

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  setTimeout(() => {
    zoomManager.setAdaptSize()
    zoomManager.setCenter()
  }, 200)
}

const toClose = () => {
  hid.value = true
  setTimeout(() => {
    emits('close')
  }, 120)
}

const imgLoadHandler = async() => {
  if (!imgRef.value || !imgRef.value.image) return
  zoomManager.naturalSize.value.height = imgRef.value.image.naturalHeight
  zoomManager.naturalSize.value.width = imgRef.value.image.naturalWidth
  zoomManager.scaleSize.value = 100
  await nextTick()
  zoomManager.setAdaptSize()
  zoomManager.setCenter()
}

const mouseScrollHandler = (e: WheelEvent) => {
  let newSize = zoomManager.scaleSize.value - e.deltaY / 10
  if (zoomManager.scaleSize.value >= 1600 && e.deltaY < 0) {
    newSize = 1600
  } else {
    newSize = Math.trunc(newSize / 10) * 10
  }
  zoomManager.setScale(Math.max(10, newSize), true)
}

const updateBarScrollTop = () => {
  if (!barItemsRef.value || !barItemsRef.value[activeIdx.value] || !barRef.value) return
  const thumb = barItemsRef.value[activeIdx.value]
  const bar = barRef.value
  bar.scrollLeft = thumb.offsetLeft - (bar.clientWidth / 2 - thumb.clientWidth / 2)
}

watch(() => activeIdx.value, async() => {
  showMainImg.value = false
  await nextTick()
  showMainImg.value = true
  setTimeout(updateBarScrollTop, 50)
}, { immediate: true })

onMounted(() => {
  activeIdx.value = props.imageIndex
})

defineExpose<ImageViewerExpose>({
  selectImage,
  setScale: zoomManager.setScale,
  setCenter: zoomManager.setCenter,
  setAdaptSize: zoomManager.setAdaptSize
})

</script>

<script lang="ts">
export default { name: 'ImageViewer' }
</script>

<style lang="scss" scoped>
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.image-viewer {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 114514;
  animation: fade-in .2s forwards;
  transition: all .2s;
  overflow: hidden;

  &.hid {
    opacity: 0;
    pointer-events: none;
  }

  .image-viewer-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(30, 30, 30, 0.95);
    z-index: 1;
  }

  .top-right-tools {
    position: absolute;
    top: 10px;
    right: 15px;
    z-index: 10;
    display: flex;
    align-items: center;
  }

  .image-container {
    flex: 1;
    position: relative;
    z-index: 5;
    overflow: hidden;
    cursor: grab;

    &:active {
      cursor: grabbing;
    }

    .main-img {
      position: absolute;
      width: v-bind('zoomManager.showSize.value.width');
      height: v-bind('zoomManager.showSize.value.height');
      top: v-bind('showPosition.top');
      left: v-bind('showPosition.left');
      max-width: none;
      max-height: none;
      transition: all .15s ease-out;

      &.no-transition {
        transition: none;
      }
    }
  }

  .bottom-area {
    position: relative;
    z-index: 10;
    background: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
    padding-bottom: 20px;
    transition: transform 0.3s;

    &.hide-list {
      .thumbnail-list-container {
        display: none;
      }
    }

    .image-tool-bar {
      display: flex;
      justify-content: center;
      align-items: center;
      text-shadow: 0 0 5px black;
      height: 50px;
      color: white;

      .image-switch {
        display: flex;
        align-items: center;
        gap: 15px;
        background: rgba(0, 0, 0, 0.4);
        padding: 5px 15px;
        border-radius: 20px;

        .image-info {
          font-size: 14px;
          user-select: none;
        }
      }
    }

    .thumbnail-list-container {
      width: 100%;
      overflow-x: auto;
      scroll-behavior: smooth;
      &::-webkit-scrollbar {
        height: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.4);
        border-radius: 3px;
      }

      .thumbnail-list {
        display: inline-flex;
        padding: 10px 20px;
        gap: 15px;
        min-width: min-content;

        .thumbnail-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 80px;
          cursor: pointer;
          opacity: 0.6;
          transition: all 0.2s;

          &:hover, &.active {
            opacity: 1;
            .thumb-img {
              border-color: rgb(var(--v-theme-primary));
              transform: scale(1.05);
            }
            .thumb-title {
              color: rgb(var(--v-theme-primary));
            }
          }

          .thumb-img {
            width: 70px;
            height: 70px;
            border: 2px solid transparent;
            border-radius: 6px;
            overflow: hidden;
            transition: all 0.2s;
            margin-bottom: 5px;
          }

          .thumb-title {
            width: 100%;
            font-size: 12px;
            color: #ddd;
            text-align: center;
          }
        }
      }
    }
  }
}
</style>
