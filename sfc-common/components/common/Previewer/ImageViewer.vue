<!-- 注：该组件除了本条注释，不包含任何人工编写的代码 -->
<template>
  <div
    class="image-viewer"
    :class="{'hid': hid, 'fullscreen-mode': isFullscreen}"
    @mousemove="activeUi"
    @touchstart="activeUi"
    @click="activeUi"
  >
    <!-- 背景区域，点击空白处关闭 -->
    <div class="image-viewer-bg" @click="toClose" />

    <!-- 右上角叉叉和全屏按钮 -->
    <div class="top-right-tools" :class="{'hide-tools': !isUiVisible}">
      <v-btn
        icon="mdi-rotate-left"
        variant="text"
        style="color: white"
        class="tool-btn mr-2"
        @click.stop="zoomManager.rotateLeft"
      />
      <v-btn
        icon="mdi-rotate-right"
        variant="text"
        style="color: white"
        class="tool-btn mr-2"
        @click.stop="zoomManager.rotateRight"
      />
      <v-btn
        icon="mdi-fullscreen"
        variant="text"
        style="color: white"
        class="tool-btn mr-2"
        @click.stop="toggleFullscreen"
      />
      <v-btn
        icon="mdi-close"
        variant="text"
        style="color: white"
        class="tool-btn"
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
        :style="{ transform: `rotate(${zoomManager.rotateDeg.value}deg)` }"
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
    <div class="bottom-area" :class="{'hide-list': !isUiVisible || zoomManager.isOverflowing.value}">
      <!-- 工具栏 -->
      <div class="image-tool-bar" :class="{'hide-toolbar': !isUiVisible || zoomManager.isOverflowing.value}">
        <div class="image-switch">
          <!-- 上一张 -->
          <v-btn
            icon="mdi-chevron-left"
            variant="text"
            color="white"
            @click.stop="switchImage(-1)"
          />
          
          <span class="image-info">
            <span class="filename text-truncate">{{ fileList[activeIdx]?.name }}</span>
            <span class="info-text">{{ activeIdx + 1 }} / {{ fileList.length }}  |  {{ zoomManager.scaleSize.value.toFixed(0) }}%</span>
          </span>
          
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
      <div ref="barRef" class="thumbnail-list-container transition-all">
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
const userActive = ref(true)
let uiHideTimer: any = null

const isUiVisible = computed(() => !isFullscreen.value || userActive.value)

// 当用户在全屏模式下操作时，显示UI并在无操作1秒后隐藏
const activeUi = () => {
  userActive.value = true
  if (uiHideTimer) clearTimeout(uiHideTimer)
  if (isFullscreen.value) {
    uiHideTimer = setTimeout(() => {
      userActive.value = false
    }, 1000)
  }
}

const imgContainerRef = ref<HTMLElement>()
const imgRef = ref<any>()
const barRef = ref<HTMLElement>()
const barItemsRef = ref<HTMLElement[]>([])

const showPosition = reactive({ top: '0px', left: '0px' })

const zoomManager = useZoomManager(imgContainerRef, imgRef, showPosition, isFullscreen)
const selectionManager = useImageSelection(props, emits, zoomManager)
const { activeIdx, showMainImg, selectImage, switchImage, imgSrc } = selectionManager

const dragManager = useDragManager(showPosition, emits, (delta) => switchImage(delta), zoomManager)
const { noTransition, mouseDownHandler, mousemoveHandler, mouseUpHandler, touchStartHandler, touchMoveHandler, touchEndHandler } = dragManager

useKeyboardManager(() => toClose(), switchImage)

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
      .catch(err => {
        console.warn('全屏请求失败:', err)
      })
  } else {
    document.exitFullscreen()
  }
}

const toClose = () => {
  hid.value = true
  if (document.fullscreenElement) {
    document.exitFullscreen()
  }
  setTimeout(() => {
    emits('close')
  }, 120)
}

const imgLoadHandler = async() => {
  if (!imgRef.value || !imgRef.value.image) return
  zoomManager.naturalSize.value.height = imgRef.value.image.naturalHeight
  zoomManager.naturalSize.value.width = imgRef.value.image.naturalWidth
  zoomManager.scaleSize.value = 100
  zoomManager.resetRotate()
  await nextTick()
  zoomManager.setAdaptSize()
  zoomManager.setCenter()
  setTimeout(() => {
    noTransition.value = false
  }, 50)
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
  noTransition.value = true
  showMainImg.value = false
  await nextTick()
  showMainImg.value = true
  setTimeout(updateBarScrollTop, 50)
}, { immediate: true })


// 监听全屏状态变化以调整UI显示和图片适应
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
  if (isFullscreen.value) {
    activeUi()
  } else {
    userActive.value = true
    if (uiHideTimer) clearTimeout(uiHideTimer)
  }
  setTimeout(() => {
    zoomManager.setAdaptSize()
    zoomManager.setCenter()
  }, 200)
}

onMounted(() => {
  activeIdx.value = props.imageIndex
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  if (uiHideTimer) clearTimeout(uiHideTimer)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
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
    top: 15px;
    right: 20px;
    z-index: 10;
    display: flex;
    align-items: center;
    transition: all 0.3s;

    &.hide-tools {
      opacity: 0;
      transform: translateY(-20px);
      pointer-events: none;
    }

    .tool-btn {
      background-color: rgba(0, 0, 0, 0.4);
      border-radius: 50%;
      text-shadow: 0 0 5px black;
      transition: background-color 0.2s;

      &:hover {
        background-color: rgba(0, 0, 0, 0.7);
      }
    }
  }

  .image-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
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
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 10;
    padding-bottom: max(20px, env(safe-area-inset-bottom));
    transition: all 0.3s;
    pointer-events: none;

    &.hide-list {
      .thumbnail-list-container {
        transform: translateY(100%);
        opacity: 0;
        pointer-events: none;
      }
    }

    * {
      pointer-events: auto;
    }

    .image-tool-bar {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 50px;
      color: white;
      transition: all 0.3s;

      &.hide-toolbar {
        opacity: 0;
        transform: translateY(20px);
        pointer-events: none;
      }

      .image-switch {
        display: flex;
        align-items: center;
        gap: 15px;
        background: rgba(0, 0, 0, 0.4);
        padding: 5px 15px;
        border-radius: 20px;
        backdrop-filter: blur(4px);
        transition: all 0.3s;
        opacity: 0.6;

        &:hover, &:active {
          opacity: 1;
          background: rgba(0, 0, 0, 0.5);
        }

        .image-info {
          display: flex;
          align-items: center;
          gap: 12px;
          user-select: none;
          
          .filename {
            max-width: 180px;
            font-size: 14px;
            font-weight: 500;
          }
          
          .info-text {
            font-size: 13px;
            color: #ddd;
            white-space: nowrap;
          }
        }
      }
    }

    .thumbnail-list-container {
      width: 100%;
      overflow-x: auto;
      scroll-behavior: smooth;
      transition: all 0.3s ease-out;

      .thumbnail-list {
        display: inline-flex;
        padding: 10px 20px;
        gap: 15px;
        min-width: min-content;

        .thumbnail-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 70px;
          cursor: pointer;
          opacity: 0.6;
          transition: all 0.2s;

          &:hover, &.active {
            opacity: 1;
            .thumb-img {
              border-color: rgb(var(--v-theme-primary));
              transform: scale(1.05);
            }
          }

          .thumb-img {
            width: 70px;
            height: 70px;
            border: 2px solid transparent;
            border-radius: 6px;
            overflow: hidden;
            transition: all 0.2s;
            background-color: rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
            justify-content: center;

            :deep(img), :deep(.v-img__img) {
              object-fit: cover !important;
              width: 100% !important;
              height: 100% !important;
            }
          }
        }
      }
    }
  }
}
</style>
