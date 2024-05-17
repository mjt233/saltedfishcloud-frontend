<template>
  <div class="image-previewer" :class="{'hid': hid}">

    <!-- 右上角叉叉 -->
    <v-icon
      v-ripple
      class="close-btn"
      icon="mdi-close"
      @click="toClose"
    />

    <!-- 预览条 -->
    <div ref="barRef" class="bar">

      <!-- 预览条自动布局容器 -->
      <grid-container
        gap="0px"
        :type="'evenly'"
        :width="180"
        :md-width="160"
        :sm-width="120"
        style="width: 100%;margin-top: 20px"
      >
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
              class="bar-img d-flex"
              :md5="file.md5"
              :file-name="file.name"
              :dir="false"
              :show-thumb="true"
              :custom-thumbnail-url="thumbnailUrlGenerator && thumbnailUrlGenerator(file)"
            />
          </div>
          <div class="bar-title text-truncate">
            {{ file.name }}
          </div>
        </div>
      </grid-container>
    </div>

    <!-- 主图预览 -->
    <div
      ref="imgContainerRef"
      class="image-container"
      @wheel="mouseScrollHandler" 
      @mousedown.prevent="mouseDownHandler"
      @mousemove="mousemoveHandler"
      @mouseup="mouseUpHandler"
      @dblclick="doubleClickHandler"
    >
      <loading-mask :loading="loading" />

      <!-- 主图 -->
      <v-img
        v-if="showMainImg"
        ref="imgRef"
        class="main-img"
        :class="{'no-transition': noTransition}"
        :src="imgSrc"
        @load="imgLoadHandler"
        @dragover.prevent
        @drop.prevent
      >
        <template #placeholder>
          <loading-mask :loading="true" :type="'circular'" />
        </template>
      </v-img>
      <div class="image-tool-bar">
        <div class="image-switch">
          <v-icon
            v-ripple
            class="btn"
            icon="mdi-arrow-left"
            @click="selectImage(activeIdx > 0 ? activeIdx - 1 : fileList.length - 1)"
          />
          <span>{{ activeIdx + 1 }}/{{ fileList.length }}</span>
          <v-icon
            v-ripple
            class="btn"
            icon="mdi-arrow-right"
            @click="selectImage(activeIdx < fileList.length - 1 ? activeIdx + 1 : 0)"
          />
          {{ scaleSize.toFixed(0) }} %
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingMask from '../LoadingMask.vue'
import FileIcon from '../FileIcon.vue'
import GridContainer from 'sfc-common/components/layout/GridContainer.vue'
// 是否加载中
const loading = ref(false)

// 当前正在预览的图片下标索引
const activeIdx = ref(0)

// 是否显示预览主图
const showMainImg = ref(true)

// 缩放大小
const scaleSize = ref(100)

// img主图容器DOM
const imgContainerRef = ref<HTMLElement>()

// img主图组件实例引用
const imgRef = ref<InstanceType<typeof VImg>>()

// 鼠标点击按下时的鼠标和图片位置
const mouseDownPosition = { y: 0, x: 0, imgY: 0, imgX: 0 }

let moving = false

// 图像原始大小
const naturalSize = reactive({
  height: 0,
  width: 0
})

// 当前显示大小
const showSize = computed(() => {
  return {
    height: (naturalSize.height * scaleSize.value / 100) + 'px',
    width: (naturalSize.width * scaleSize.value / 100) + 'px',
  }
})

// 当前显示位置
const showPosition = reactive({
  top: '0px',
  left: '0px'
})

// 是否关闭主图的CSS过渡
const noTransition = ref(false)

const props = defineProps({
  /**
   * 待预览的图片列表
   */
  fileList: {
    type: Array as PropType<FileInfo[]>,
    default: () => []
  },
  /**
   * 外部指定要预览的图片下标
   */
  imageIndex: {
    type: Number,
    default: 0
  },
  /**
   * 主图的url生成策略函数，默认使用根据md5加载
   */
  urlGenerator: {
    type: Function as PropType<((fileInfo: FileInfo) => string)>,
    default: undefined
  },
  /**
   * 缩略图的自定义url生成器
   */
  thumbnailUrlGenerator: {
    type: Function as PropType<((fileInfo: FileInfo) => string)>,
    default: undefined
  }
})

/**
 * 选择一张图片预览
 * @param idx 图片下标索引
 */
const selectImage = async(idx: number) => {
  activeIdx.value = idx
  imgActions.setAdaptSize()
  await nextTick()
  imgActions.setCenter()
  emits('update:imageIndex', idx)
}

/**
 * 主图鼠标按下时处理函数，记录最初点击的鼠标坐标用于后续计算鼠标发生移动的位置。
 * @param e 鼠标事件
 */
const mouseDownHandler = (e: MouseEvent) => {
  mouseDownPosition.x = e.clientX
  mouseDownPosition.y = e.clientY
  mouseDownPosition.imgX = parseFloat(showPosition.left)
  mouseDownPosition.imgY = parseFloat(showPosition.top)
  moving = true
}

/**
 * 主图鼠标移动时处理函数
 * @param e 鼠标事件
 */
const mousemoveHandler = (e: MouseEvent) => {
  if (!moving) {
    return
  }
  noTransition.value = true
  const moveX = e.clientX - mouseDownPosition.x
  const moveY = e.clientY - mouseDownPosition.y
  showPosition.left = mouseDownPosition.imgX + moveX + 'px'
  showPosition.top = mouseDownPosition.imgY + moveY + 'px'
}

/**
 * 主图鼠标放开时处理函数
 * @param e 鼠标事件
 */
const mouseUpHandler = (e: MouseEvent) => {
  noTransition.value = false
  moving = false
}

/**
 * 鼠标滚轮滚动事件处理函数，计算缩放值
 * @param e 滚轮滚动事件
 */
const mouseScrollHandler = (e: WheelEvent) => {
  let newSize = scaleSize.value - e.deltaY/10
  if (scaleSize.value >= 1600 && e.deltaY < 0) {
    newSize = 1600
  } else {
    newSize = Math.trunc(newSize / 10)*10
  }
  imgActions.setScale(Math.max(0, newSize), true)
}

/**
 * 主图价值完毕处理器，记录原始尺寸，并重置缩放
 */
const imgLoadHandler = async() => {
  if (!imgRef.value || !imgRef.value.image) {
    return
  }
  naturalSize.height = imgRef.value.image.naturalHeight
  naturalSize.width = imgRef.value.image.naturalWidth
  scaleSize.value = 100
  await nextTick()
  imgActions.setAdaptSize()
  imgActions.setCenter()
}

const imgActions = {
  /**
   * 设置主图缩放大小
   * @param scale 缩放大小
   * @param fromCenter  是否从图像中间锚点缩放 
   */
  async setScale(scale: number, fromCenter?: boolean) {
    if (!fromCenter) {
      scaleSize.value = scale
    } else {
      // 计算缩放后前后尺寸之差，
      const originWidth = parseFloat(showSize.value.width)
      const originHeight = parseFloat(showSize.value.height)
      scaleSize.value = scale
      await nextTick()
      const newWidth = parseFloat(showSize.value.width)
      const newHeight = parseFloat(showSize.value.height)
      showPosition.left = parseFloat(showPosition.left) - ((newWidth - originWidth) / 2) + 'px'
      showPosition.top = parseFloat(showPosition.top) - ((newHeight - originHeight) / 2) + 'px'
    }
  },
  /**
   * 使图片定位居中
   */
  setCenter() {
    const { width, height } = showSize.value
    const { clientHeight: containerHeight, clientWidth: containerWidth } = imgContainerRef.value as HTMLElement
    const imgWidth = parseFloat(width), imgHeight = parseFloat(height)
    showPosition.top = (containerHeight - imgHeight) / 2 + 'px'
    showPosition.left = (containerWidth - imgWidth) / 2 + 'px'
  },
  /**
   * 设置图片为自适应尺寸
   */
  setAdaptSize() {
    const { naturalWidth: imgWidth, naturalHeight: imgHeight } = (imgRef.value?.image) as HTMLImageElement 
    const { clientHeight: containerHeight, clientWidth: containerWidth } = imgContainerRef.value as HTMLElement
    if (imgWidth <= containerWidth && imgHeight <= containerHeight) {
      scaleSize.value = 100
      return
    }
    const xRatio = containerWidth/imgWidth * 100
    const yRatio = containerHeight/imgHeight * 100

    scaleSize.value = Math.min(xRatio, yRatio)
  }
}

const doubleClickHandler = () => {
  imgActions.setAdaptSize()
  imgActions.setCenter()
}

/**
 * 监听外部props的imageIndex属性变化，同步更新到activeIdx并触发选择预览操作
 */
watch(() => props.imageIndex, () => {
  if (props.imageIndex != activeIdx.value) {
    selectImage(props.imageIndex)
  }
})

/**
 * 图片的显示地址
 */
const imgSrc = computed(() => {
  const targetFile = props.fileList[activeIdx.value]
  if (props.urlGenerator) {
    return props.urlGenerator(targetFile)
  } else {
    return StringUtils.appendPath(API.getDefaultPrefix(), API.resource.downloadFileByMD5(targetFile.md5, targetFile.name).url)
  }
  
})

/**
 * 监听图片显示地址变化，变化后强制重新渲染v-img组件防止因过渡效果而导致图片无法显示
 */
watch(imgSrc, async() => {
  showMainImg.value = false
  await nextTick()
  showMainImg.value = true
  updateBarScrollTop()
})

/**
 * 声明事件
 */
const emits = defineEmits(['close', 'update:imageIndex'])

/**
 * 是否隐藏当前组件（变透明，用于挂载后和关闭前的过渡特效）
 */
const hid = ref(false)

/**
 * 执行关闭当前组件
 */
const toClose = () => {
  // 移除键盘按键监听，并添加隐藏过渡效果，过渡结束后抛出close事件
  window.removeEventListener('keydown', keyHandler)
  hid.value = true
  setTimeout(() => {
    emits('close')  
  }, 120)
  
}

/**
 * 待预览图片缩略图的元素引用
 */
const barItemsRef = ref() as Ref<HTMLElement[]>


/**
 * 待预览图片条的元素引用
 */
const barRef = ref() as Ref<HTMLElement>

/**
 * 更新待预览图片条的滚动高度，使当前预览的图片位于中间
 */
const updateBarScrollTop = () => {
  const thumb = barItemsRef.value[activeIdx.value]
  const bar = barRef.value
  bar.scrollTop = thumb.offsetTop - (bar.clientHeight / 2 - thumb.clientHeight)
}

/**
 * 键盘按下Esc按的处理函数
 * @param e 事件
 */
const keyHandler = (e: KeyboardEvent) => {
  if (e.key == 'Escape') {
    toClose()
  } else if (e.key == 'ArrowLeft') {
    selectImage(activeIdx.value > 0 ? activeIdx.value - 1 : props.fileList.length - 1)
  } else if (e.key == 'ArrowRight') {
    selectImage(activeIdx.value < props.fileList.length - 1 ? activeIdx.value + 1 : 0)
  }
}


onMounted(() => {
  // 挂载后，添加键盘按键监听，并更新预览下标（监听的移除在toClose中，所以如果需要关闭该组件，应统一调用toClose方法）
  window.addEventListener('keydown', keyHandler)
  activeIdx.value = props.imageIndex
})

onUnmounted(() => {
  window.removeEventListener('keydown', keyHandler)
})


defineExpose({
  selectImage,
  ...imgActions
})

</script>

<script lang="ts">
import { FileInfo } from 'sfc-common/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { StringUtils } from 'sfc-common/utils/StringUtils'
import API from 'sfc-common/api'
import { VImg } from 'vuetify/components'
import { reactive } from 'vue'

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

  // 预览条
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
    
    // 预览条中的预览项
    .bar-item {
      display: flex;
      flex-direction: column;
      height: 114px;
      margin: 3px 18px;
      align-items: center;
    }

    // 预览条中的图片文件名
    .bar-title {
      width: 100%;
      opacity: .8;
      height: 28px;
      transition: all .1s;
    }

    // 预览条中的预览图片容器
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
    
    @media screen and (max-width: 1024px) {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 360px;
      box-shadow: 0 0 25px 3px black;
      z-index: 1;
      overflow: auto;
      .bar-item {
        width: 128px;
        margin: 0 auto;
      }
    }
    @media (max-width: 640px) {
      .bar-item {
        width: 96px;
      }
    }
    @media screen and (max-height: 480px) {
      height: 140px;
    }
  }

  // 预览主图容器
  .image-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    @media screen and (max-width: 1024px) {
      height: calc(100% - 360px)
    }
    @media screen and (max-height: 480px) {
      height: calc(100% - 140px)
    }
    
    // 预览主图
    .main-img {
      width: v-bind('showSize.width');
      height: v-bind('showSize.height');
      top: v-bind('showPosition.top');
      left: v-bind('showPosition.left');
      max-width: unset;
      max-height: unset;
      transition: all .1s;
      cursor: grab;
      &:active {
        cursor: grabbing;
      }
      &.no-transition {
        transition: none;
      }
    }

    // 主图下方的工具按钮栏
    .image-tool-bar {
      position: absolute;
      width: 100%;
      height: 60px;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      text-shadow: 0 0 5px black;
      .image-switch {
        display: flex;
        justify-content: center;
        align-items: center;

        &>.btn {
          cursor: pointer;
          min-width: 36px;
          padding: 21px;
          margin: 0 6px;
          border-radius: 50%;
        }
      }
    }
  }
}
</style>