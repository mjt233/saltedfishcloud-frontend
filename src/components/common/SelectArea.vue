<template>
  <div
    class="select-area"
    :class="{active: active && areaWidth > 5 && areaHeight > 5}"
    :style="areaStyle"
  />
</template>

<script setup lang="ts">
const props = defineProps({
  scrollAnchor: {
    type: HTMLElement,
    default: undefined
  },
  /**
   * 触发框选激活的框选大小
   */
  triggerSize: {
    type: Number,
    default: 6
  }
})
const active = ref(false)
const parentEl = ref() as Ref<HTMLElement>
const moveEvent = ref() as Ref<MouseEvent>
const scrollAnchorEl  = ref() as Ref<HTMLElement>

let downX: number
let downY: number
let downScrollX: number
let downScrollY: number
let scrollHeight: number = 0
let scrollWidth: number = 0
let anchorTop: number = 0
let anchorLeft: number = 0

const areaLeft = ref(0)
const areaTop = ref(0)
const viewTop = ref(0)
const areaWidth = ref(0)
const areaHeight = ref(0)
const maxWidth = ref(0)
const maxHeight = ref(0)

const areaStyle = computed(() => {
  return {
    top: areaTop.value + 'px',
    left: areaLeft.value + 'px',
    width: areaWidth.value + 'px',
    height: areaHeight.value + 'px'
  }
})

const wrapperStyle = computed(() => {
  return {
    height: '0px',
    width: '0px'
  }
})

/**
 * 鼠标按下时执行的回调，执行初始化操作，记录各项初始值以判断后续操作中鼠标移动、元素滚动的方向和距离
 * @param e 鼠标点击事件
 */
const downHandler = (e: MouseEvent) => {


  scrollAnchorEl.value = props.scrollAnchor || parentEl.value
  anchorLeft = scrollAnchorEl.value.getBoundingClientRect().left
  anchorTop = scrollAnchorEl.value.getBoundingClientRect().top
  parentEl.value.style.userSelect = 'none'

  downX = e.pageX
  downY = e.pageY
  downScrollX = scrollAnchorEl.value.scrollLeft
  downScrollY = scrollAnchorEl.value.scrollTop
  scrollWidth = 0
  scrollHeight = 0

  window.addEventListener('mousemove', moveHandler)
  window.addEventListener('mouseup', upHandler)
  scrollAnchorEl.value.addEventListener('scroll', scrollHandler)
}

/**
 * 滚动回调
 * @param e 滚动事件
 */
const scrollHandler = (e: Event) => {
  scrollHeight = downScrollY - scrollAnchorEl.value.scrollTop
  scrollWidth = downScrollX - scrollAnchorEl.value.scrollLeft
  updateArea()
}

/**
 * 鼠标移动回调
 * @param e 鼠标事件
 */
const moveHandler = (e: MouseEvent) => {
  moveEvent.value = e
  updateArea()
}

/**
 * 更新框选区域大小和坐标
 */
const updateArea = () => {
  const e = moveEvent.value

  // 元素的滚动距离叠加到鼠标下按的初始坐标，即滚动时，带着初始坐标移动
  const startX = downX + scrollWidth
  const startY = downY + scrollHeight

  // 高/宽度 = 初始坐标 与 当前坐标的差值的绝对值
  const width = Math.abs(startX - e.pageX)
  const height = Math.abs(startY - e.pageY)
  areaHeight.value = height
  areaWidth.value = width

  
  areaLeft.value = startX < e.pageX ? startX : (startX - width)
  areaTop.value = startY < e.pageY ? startY : (startY - height)

  // if (startY < e.pageY) {
  //   maxHeight.value = scrollAnchorEl.value.clientHeight - (downY - anchorTop)
  // } else {
  //   maxHeight.value = downY - anchorTop
  // }

  // 非激活状态下，框选区域长或宽大于触发阈值时 激活框选显示
  if (!active.value && (areaHeight.value > props.triggerSize || areaWidth.value > props.triggerSize)) {
    active.value = true
  }

  // viewTop.value = viewStartY < e.pageY ? viewStartY : (viewStartY - height)
  
}

/**
 * 鼠标抬起事件，结束框选
 * @param e 鼠标事件
 */
const upHandler = (e: MouseEvent) => {
  window.removeEventListener('mousemove', moveHandler)
  scrollAnchorEl.value.removeEventListener('scroll', scrollHandler)
  if (active.value) {
    e.stopImmediatePropagation()
    e.stopPropagation()
  }
  active.value = false
}

onMounted(() => {
  parentEl.value = getCurrentInstance()?.proxy?.$parent?.$el || document.body
  window.addEventListener('mousedown', downHandler)
})

onUnmounted(() => {
  window.removeEventListener('mousedown', downHandler)
})
</script>

<script lang="ts">
import { computed, defineComponent, getCurrentInstance, onMounted, onUnmounted, reactive, Ref, ref } from 'vue'
import { context } from '@/core/context'
import DOMUtils from '@/utils/DOMUtils'

export default defineComponent({
  name: 'SelectArea'
})
</script>


<style lang="scss" scoped>
.select-area {
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(var(--v-theme-primary), .6);
  border: 1px solid  rgba(var(--v-theme-primary));
  z-index: 100;
  transition: opacity .2s;
  opacity: 0;
  pointer-events: none;

  &.active {
    pointer-events: all;
    opacity: 1;
  }
}

</style>