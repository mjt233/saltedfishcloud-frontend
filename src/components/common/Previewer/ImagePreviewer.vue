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

    <!-- 主图预览 -->
    <div class="image-container">
      <loading-mask :loading="loading" />

      <!-- 主图 -->
      <v-img v-if="showMainImg" class="main-img" :src="imgSrc">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingMask from '../LoadingMask.vue'
import FileIcon from '../FileIcon.vue'
import GridContainer from '@/components/layout/GridContainer.vue'
// 是否加载中
const loading = ref(false)

// 当前正在预览的图片下标索引
const activeIdx = ref(0)

// 是否显示预览主图
const showMainImg = ref(true)

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
  }
})

/**
 * 选择一张图片预览
 * @param idx 图片下标索引
 */
const selectImage = (idx: number) => {
  activeIdx.value = idx
  emits('update:imageIndex', idx)
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
  return StringUtils.appendPath(API.getDefaultPrefix(), API.resource.downloadFileByMD5(targetFile.md5, targetFile.name).url)
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
    @media screen and (max-width: 1024px) {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 360px;
      overflow: auto;
    }
    @media screen and (max-height: 480px) {
      height: 140px;
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
  }

  // 预览主图容器
  .image-container {
    width: 100%;
    height: 100%;
    position: relative;
    @media screen and (max-width: 1024px) {
      height: calc(100% - 360px)
    }
    @media screen and (max-height: 480px) {
      height: calc(100% - 140px)
    }
    
    // 预览主图
    .main-img {
      width: 100%;
      height: 100%;
    }
    .image-tool-bar {
      position: absolute;
      width: 100%;
      height: 60px;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
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