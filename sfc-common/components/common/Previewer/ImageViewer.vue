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

    <!-- 主图区（与左侧缩略图侧栏并列） -->
    <div class="main-area">
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

      <!-- 底部控制栏（仅工具栏，缩略图已迁移至左侧侧栏） -->
      <div class="bottom-area" :class="{'hide-toolbar': !isUiVisible || zoomManager.isOverflowing.value}">
        <div class="image-tool-bar">
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
      </div>
    </div>

    <!-- 右侧缩略图侧栏（纵向虚拟滚动，仅渲染可视区域，支持大量图片） -->
    <div
      ref="sidebarRef"
      class="thumbnail-sidebar"
      :class="{'hide-list': !isUiVisible || zoomManager.isOverflowing.value}"
    >
      <!-- 内层容器：固定宽度，隐藏时向右滑出；外层负责收缩宽度释放空间 -->
      <div class="thumbnail-sidebar-inner">
        <VVirtualScroll
          ref="barRef"
          :items="fileList"
          :item-key="itemKey"
          :height="sidebarHeight"
          :item-height="THUMB_ITEM_HEIGHT"
        >
          <template #default="{ item, index }">
            <div
              class="thumbnail-item"
              :class="{'active': index === activeIdx}"
              @click="selectImage(index)"
            >
              <file-icon
                class="thumb-img"
                :md5="item.md5"
                :file-name="item.name"
                :dir="false"
                :show-thumb="true"
                :custom-thumbnail-url="thumbnailUrlGenerator && thumbnailUrlGenerator(item)"
              />
              <div class="thumbnail-title text-truncate">
                {{ item.name }}
              </div>
            </div>
          </template>
        </VVirtualScroll>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted, Ref } from 'vue'
import LoadingMask from '../LoadingMask.vue'
import FileIcon from '../FileIcon.vue'
import { VImg, VVirtualScroll } from 'vuetify/components'
import { imageViewerProps, imageViewerEmits, ImageViewerExpose } from './imageViewerParams'
import { useZoomManager } from './composables/useZoomManager'
import { useDragManager } from './composables/useDragManager'
import { useImageSelection } from './composables/useImageSelection'
import { useKeyboardManager } from './composables/useKeyboardManager'
import { useResizeObserver } from 'sfc-common/composables/useResizeObserver'

const props = defineProps(imageViewerProps)
const emits = defineEmits(imageViewerEmits)

const hid = ref(false)
const loading = ref(false)
const isFullscreen = ref(false)
const userActive = ref(true)
let uiHideTimer: any = null

const isUiVisible = computed(() => !isFullscreen.value || userActive.value)

// 缩略图单项高度（缩略图 70px + 文件名行 + 间距），需与样式实际高度对齐
const THUMB_ITEM_HEIGHT = 96

// VVirtualScroll 的 item-key，fileList 静态，使用 md5+index 保证唯一稳定
const itemKey = computed(() => (item: any, index: number) => (item?.md5 ?? '') + '_' + index)

// 左侧缩略图侧栏容器引用
const sidebarRef = ref<HTMLElement>()

// 侧栏可用高度，供 VVirtualScroll 虚拟化使用
const sidebarHeight = ref(400)

// 监听侧栏尺寸变化，同步更新 VVirtualScroll 高度
useResizeObserver(
  () => sidebarRef.value as HTMLElement,
  (entries) => {
    const entry = entries[0]
    if (entry) {
      sidebarHeight.value = Math.floor(entry.contentRect.height)
    }
  }
)

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
// barRef 指向 VVirtualScroll 组件实例，其 $el 为滚动容器
const barRef = ref<any>()

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

/**
 * 滚动缩略图侧栏使当前预览项居中可见。
 * 使用虚拟滚动后仅渲染可视区域，按 index * itemHeight 计算 scrollTop，
 * 无需访问每个 item 的 DOM，避免大量节点时的卡顿。
 * @param smooth 是否使用平滑滚动动画。初始化定位时应为 false，避免沿途缩略图被加载导致服务器压力。
 */
const scrollToActiveThumb = (smooth = true) => {
  const inst = barRef.value
  if (!inst) return
  // VVirtualScroll 的滚动容器为其根 $el
  const scrollEl: HTMLElement = inst.$el ?? inst
  if (!scrollEl || typeof scrollEl.scrollTo !== 'function') return
  const targetTop = activeIdx.value * THUMB_ITEM_HEIGHT
  // 使当前项大致居中
  const centerOffset = (scrollEl.clientHeight - THUMB_ITEM_HEIGHT) / 2
  scrollEl.scrollTo({
    top: Math.max(0, targetTop - centerOffset),
    behavior: smooth ? 'smooth' : undefined
  })
}

// 标记组件是否已完成初始化（首次 activeIdx 定位），
// 初始化完成前 watch 回调不触发滚动动画，由 onMounted 中的 scrollToActiveThumb(false) 统一处理
let initialized = false

watch(() => activeIdx.value, async() => {
  noTransition.value = true
  showMainImg.value = false
  await nextTick()
  showMainImg.value = true
  if (initialized) {
    setTimeout(() => scrollToActiveThumb(true), 50)
  }
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

onMounted(async() => {
  activeIdx.value = props.imageIndex
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  // 等待侧栏高度测量与虚拟滚动挂载后，显式滚动到初始预览项（无动画，避免沿途缩略图被加载）
  await nextTick()
  // 标记初始化完成，后续 activeIdx 变更走平滑滚动动画
  setTimeout(() => {
    scrollToActiveThumb(false)
    initialized = true
  }, 200)
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
  display: flex;
  flex-direction: row;

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

  // 主图区（与左侧缩略图侧栏并列）
  .main-area {
    position: relative;
    flex: 1;
    height: 100%;
    z-index: 5;
    overflow: hidden;
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

  // 底部工具栏（仅工具栏，相对主图区底部定位）
  .bottom-area {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 10;
    padding-bottom: max(20px, env(safe-area-inset-bottom));
    transition: all 0.3s;
    pointer-events: none;

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

    &.hide-toolbar {
      opacity: 0;
      transform: translateY(20px);
      pointer-events: none;
    }
  }

  // 右侧缩略图侧栏（纵向虚拟滚动）
  .thumbnail-sidebar {
    --sidebar-width: 120px;
    position: relative;
    flex-shrink: 0;
    width: var(--sidebar-width);
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 6;
    overflow: hidden;
    // 隐藏时收缩宽度以释放 flex 空间，使主图可利用该区域
    transition: width 0.3s ease-out;

    &.hide-list {
      width: 0;
      pointer-events: none;
    }

    // 内层容器：固定宽度，隐藏时向右滑出（侧栏位于右侧，应向右过渡）
    .thumbnail-sidebar-inner {
      width: var(--sidebar-width);
      height: 100%;
      transition: transform 0.3s ease-out, opacity 0.3s ease-out;
    }

    &.hide-list .thumbnail-sidebar-inner {
      transform: translateX(100%);
      opacity: 0;
    }

    .thumbnail-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      height: 96px;
      padding: 8px 6px 4px;
      box-sizing: border-box;
      cursor: pointer;
      opacity: 0.6;
      transition: all 0.2s;

      &:hover, &.active {
        opacity: 1;
        .thumb-img {
          border-color: rgb(var(--v-theme-primary));
        }
        .thumbnail-title {
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

      .thumbnail-title {
        width: 100%;
        margin-top: 4px;
        font-size: 11px;
        color: #ddd;
        text-align: center;
        transition: all 0.2s;
      }
    }

    // 平板宽度收窄侧栏
    @media screen and (max-width: 1024px) {
      --sidebar-width: 96px;

      .thumbnail-item {
        .thumb-img {
          width: 60px;
          height: 60px;
        }
      }
    }

    // 手机宽度进一步收窄并隐藏文件名
    @media screen and (max-width: 640px) {
      --sidebar-width: 72px;

      .thumbnail-item {
        height: 80px;
        padding: 4px 2px;

        .thumb-img {
          width: 56px;
          height: 56px;
        }

        .thumbnail-title {
          display: none;
        }
      }
    }
  }
}
</style>
