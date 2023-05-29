<template>
  <div class="main-container" :style="resizeableStyle">
    <div class="left-slot" :class="{'hide-right': hideRight, 'auto-hide-right': autoHideRight}">
      <slot />
    </div>
    
    <div
      v-if="!hideRight"
      v-ripple
      class="show-right-btn"
      flat
      @click="showRight = !showRight"
    >
      <CommonIcon :icon="showRight ? 'mdi-chevron-right' : 'mdi-chevron-left'" />
    </div>
    <div v-if="!hideRight" class="right-slot" :class="{'auto-hide-right': autoHideRight, 'active': showRight}">
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
      <div ref="resizeableRef" style="width: 100%;overflow: auto;scroll-behavior:smooth">
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

const emits = defineEmits(['right-scroll'])


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
  right: 0;
  width: 32px;
  height: 32px;
  color: rgb(var(--v-theme-background));
  background-color: rgb(var(--v-theme-primary));
  z-index: 2;
  bottom: 15%;
  font-size: 18px;
  border-radius: 50%;
  margin: 6px;
  cursor: pointer;
  @media (max-width: 720px) {
    & {
      display: inline-flex;
      justify-content: center;
      position: absolute;
    }
  }
}
.right-slot {
  display: flex;
  max-height: 100%;
  min-width: 128px;
  width: calc(40% + var(--width-offset));
  overflow: auto;
  z-index: 1;
  @media (max-width: 720px) {
    &.auto-hide-right {
      position: absolute;
      width: 100%;
      height: 100%;
      // padding-top: 20px;
      // left: 10%;
      opacity: 0;
      pointer-events: none;
      background-color: rgb(var(--v-theme-background));
      transform: scale(.8);
      transition: all .15s;
      &.active {
        transform: scale(1);
        top: 0;
        left: 0;
        opacity: 1;
        pointer-events: all;
      }
    }
  }
}

// 切割线
.spacer-line {
  display: inline-block;
  width: 10px;
  max-width: 10px;
  min-width: 10px;
  height: 100%;
  margin: 0 3px;
  border-width: 0 1px;
  border-color: rgba($color: var(--v-theme-primary), $alpha: .08);
  border-style: solid;
  cursor: col-resize;
  transition: all .1s;
  &:hover,&:active,&.active {
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