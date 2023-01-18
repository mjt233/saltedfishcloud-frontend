<template>
  <div class="d-flex" :style="resizeableStyle">
    <div class="left-slot" :class="{'hide-right': hideRight}">
      <slot />
    </div>
    
    <template v-if="!hideRight">
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
      <div class="right-slot">
        <slot name="resizeable" />
      </div>
    </template>
    
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
  }
})
const resizing = ref(false)
const widthOffset = ref('0px')
const resizeableStyle =  computed(() => {
  return {
    '--width-offset': widthOffset.value
  } as StyleValue 
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

</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed, StyleValue } from 'vue'

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
}
.right-slot {
  max-height: 100%;
  min-width: 128px;
  width: calc(40% + var(--width-offset));
  overflow: auto;
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
}


</style>