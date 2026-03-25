<template>
  <div class="main-container" :style="resizeableStyle">
    <!-- 左侧插槽 -->
    <div class="left-slot" :class="{'hide-right': hideRight, 'auto-hide-right': autoHideRight}">
      <slot />
    </div>

    <!-- 右侧插槽显示/隐藏切换按钮 -->
    <div
      v-if="!hideRight"
      v-ripple
      class="show-right-btn"
      :class="{ 'active': showRight }"
      flat
      @click="showRight = !showRight"
    >
      <v-icon :icon="showRight ? 'mdi-chevron-right' : 'mdi-bookmark-minus-outline'" />
    </div>

    <!-- 右侧部分 -->
    <div v-if="!hideRight" class="right-slot" :class="{'auto-hide-right': autoHideRight, 'active': showRight}">

      <!-- 左右插槽分割线 -->
      <div
        class="spacer-line d-flex align-center justify-center"
        :class="{active: resizing}"
        @touchstart.prevent="spacerTouchStart"
        @mousedown="spacerTouchStart"
      >
        <div style="line-height: 5px; user-select: none;">
          .<br>.<br>.<br>
        </div>
      </div>

      <!-- 右侧插槽 -->
      <div ref="resizeableRef" style="position: relative;width: 100%;overflow: auto;scroll-behavior:smooth">
        <slot name="resizeable" />
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  /**
   * 是否隐藏右侧插槽
   */
  hideRight: {
    type: Boolean,
    default: false
  },
  /**
   * 当宽度较小时是否自动隐藏右侧
   */
  autoHideRight: {
    type: Boolean,
    default: true
  },
  /**
   * 当autoHideRight为true，且右侧容器在满足隐藏条件且激活显示时，展示右侧时的y轴偏移位置
   */
  rightActiveOffsetY: {
    type: String,
    default: '0px'
  }
})
const resizing = ref(false)
const widthOffset = ref('0px')
const showRight = ref(false)
const resizeableStyle =  computed(() => {
  return {
    '--width-offset': widthOffset.value
  } as StyleValue 
})

// 右侧可伸缩大小的容器引用
const resizeableRef = ref() as Ref<HTMLElement>

const emits = defineEmits<{
  (event: 'right-scroll', e: Event): void
  /**
   * 右侧容器激活状态改变时触发
   */
  (event: 'rightActiveChange', e: boolean): void
}>()

watch(showRight, () => {
  emits('rightActiveChange', showRight.value)
})


/**
 * README.md视图切割线点击开始
 */
const spacerTouchStart = (e: TouchEvent | MouseEvent) => {
  document.body.classList.add('no-select')
  const originOffset = parseInt(widthOffset.value || '0px')
  let originX = 0
  resizing.value = true
  if (e instanceof TouchEvent) {
    originX = e.touches[0].screenX
  } else {
    originX = e.screenX
  }
  const moveAction = (me: TouchEvent | MouseEvent) => {
    let offsetX = 0
    if (me instanceof TouchEvent) {
      offsetX = originX - me.touches[0].screenX
    } else {
      offsetX = originX - me.screenX
    }
    offsetX += originOffset
    widthOffset.value = offsetX + 'px'
  }
  const releaseAction = () => {
    resizing.value = false
    document.body.classList.remove('no-select')
    window.removeEventListener('mouseup', releaseAction)
    window.removeEventListener('touchend', releaseAction)
    window.removeEventListener('mousemove', moveAction)
    window.removeEventListener('touchmove', moveAction)
  }
  window.addEventListener('mouseup', releaseAction)
  window.addEventListener('touchend', releaseAction)
  window.addEventListener('mousemove', moveAction)
  window.addEventListener('touchmove', moveAction)
}

const addScrollListener = () => {
  resizeableRef.value?.addEventListener('scroll', e => {
    emits('right-scroll', e)
  })
}

onMounted(() => {
  addScrollListener()
})

defineExpose({
  /**
   * 获取右侧弹性容器DOM
   */
  getRightDOM() {
    return resizeableRef.value
  }
})
watch(() => props.hideRight, addScrollListener)

</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed, StyleValue, onMounted, watch } from 'vue'

export default defineComponent({
  name: 'ResizeContainer'
})
</script>


<style scoped lang="scss">
.left-slot {
  position: relative;
  min-width: 128px;
  width: calc(60% - var(--width-offset));
  &.hide-right {
    width: 100%;
  }
  @media (max-width: 720px) {
    &.auto-hide-right {
      width: 100%
    }
  }
}

// 右侧插槽显示/隐藏切换按钮
.show-right-btn {
  position: absolute;
  display: none;
  right: 12px;
  width: 42px;
  height: 42px;
  color: rgb(var(--v-theme-background));
  background-color: rgb(var(--v-theme-primary));
  bottom: 15%;
  font-size: 18px;
  border-radius: 50%;
  margin: 6px;
  cursor: pointer;
  transition: all .1s;
  @media (max-width: 720px) {
    & {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      z-index: 2334;
    }
    &.active {
      right: 0px;
      width: 32px;
      height: 28px;
      margin-bottom: 16px;
      border-radius: 32px 0 0 32px;
    }
  }
}
.right-slot {
  display: flex;
  max-height: 100%;
  min-width: 128px;
  width: calc(40% + var(--width-offset));
  overflow: auto;
  @media (max-width: 720px) {
    &.auto-hide-right {
      position: absolute;
      width: 100%;
      height: calc(100% - var(v-bind(rightActiveOffsetY)));
      left: 0;
      bottom: 0;
      opacity: 0;
      pointer-events: none;
      background-color: rgb(var(--v-theme-background));
      z-index: 2333;
      transform: scale(.1);
      transition: all .15s;
      &.active {
        transform: scale(1);
        top: v-bind(rightActiveOffsetY);
        opacity: 1;
        pointer-events: all;
      }
    }
  }
}

// 切割线
.spacer-line {
  width: 10px;
  max-width: 10px;
  min-width: 10px;
  height: 100%;
  margin: 0 3px;
  border-width: 0 1px;
  border-color: rgba($color: var(--v-theme-on-surface), $alpha: .1);
  border-style: dashed;
  cursor: col-resize;
  transition: all .1s;
  &:hover,&:active,&.active {
    border-width: 0px;
    background-color: rgba($color: var(--v-theme-primary), $alpha: .08);
  }
  @media (max-width: 720px) {
    & {
      display: none !important;
    }
  }
}

.main-container {
  display: flex;
  // position: relative;
}


</style>