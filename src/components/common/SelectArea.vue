<template>
  <div
    ref="areaRef"
    class="select-area"
    :class="{active: active && areaWidth > 5 && areaHeight > 5}"
    :style="areaStyle"
  />
</template>

<script setup lang="ts">
const props = defineProps({
  /**
   * 滚动监听锚点DOM
   */
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
  },
  /**
   * 待选则的元素
   */
  selectElementsGetter: {
    type: Function as PropType<() => (HTMLElement[] | NodeList)>,
    default: () => () => []
  }
})
const areaRef = ref() as Ref<HTMLElement>
const emits = defineEmits(['selectStart', 'selectMove', 'selectEnd'])
const active = ref(false)
const parentEl = ref() as Ref<HTMLElement>
const moveEvent = ref() as Ref<MouseEvent>
const scrollAnchorEl  = ref() as Ref<HTMLElement>

let downX: number
let downY: number
let downScrollX: number
let downScrollY: number
let scrollTop: number = 0
let scrollLeft: number = 0
let anchorTop: number = 0
let anchorLeft: number = 0

const areaLeft = ref(0)
const areaTop = ref(0)
const areaWidth = ref(110)
const areaHeight = ref(110)
let thisEl: HTMLElement
let originPosition

const areaStyle = computed(() => {
  return {
    top: areaTop.value + 'px',
    left: areaLeft.value + 'px',
    width: areaWidth.value + 'px',
    height: areaHeight.value + 'px'
  }
})

let selectElements: HTMLElement[]

/**
 * 鼠标按下时执行的回调，执行初始化操作，记录各项初始值以判断后续操作中鼠标移动、元素滚动的方向和距离
 * @param e 鼠标点击事件
 */
const downHandler = (e: MouseEvent) => {


  // 数据初始化，记录锚点DOM在全页面的位置，滚动高度
  scrollAnchorEl.value = props.scrollAnchor || parentEl.value
  anchorLeft = scrollAnchorEl.value.getBoundingClientRect().left
  anchorTop = scrollAnchorEl.value.getBoundingClientRect().top
  downScrollX = scrollLeft = scrollAnchorEl.value.scrollLeft
  downScrollY = scrollTop = scrollAnchorEl.value.scrollTop

  originPosition = getComputedStyle(scrollAnchorEl.value, null).position
  if (originPosition == 'static') {
    scrollAnchorEl.value.classList.add('relative-position')
  }
  parentEl.value.style.userSelect = 'none'
 

  downX = e.pageX - anchorLeft
  downY = e.pageY - anchorTop + downScrollY
  window.addEventListener('mousemove', moveHandler)
  window.addEventListener('mouseup', upHandler)
  scrollAnchorEl.value.addEventListener('scroll', scrollHandler)

  scrollAnchorEl.value.appendChild(thisEl)
  selectElements = props.selectElementsGetter() as HTMLElement[]
}

/**
 * 滚动回调
 * @param e 滚动事件
 */
const scrollHandler = (e: Event) => {
  scrollTop = scrollAnchorEl.value.scrollTop
  scrollLeft = scrollAnchorEl.value.scrollLeft
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
  const startX = downX 
  const startY = downY
  const endX = e.pageX - anchorLeft + scrollLeft
  const endY = e.pageY - anchorTop + scrollTop

  // 高/宽度 = 初始坐标 与 当前坐标的差值的绝对值
  const width = Math.abs(startX - endX)
  const height = Math.abs(startY - endY)
  areaHeight.value = height
  areaWidth.value = width

  areaLeft.value = startX < endX ? startX : (startX - width)
  areaTop.value = startY < endY ? startY : (startY - height)


  // 非激活状态下，框选区域长或宽大于触发阈值时 激活框选显示
  if (!active.value && (areaHeight.value > props.triggerSize || areaWidth.value > props.triggerSize)) {
    active.value = true
    emits('selectStart')
  }

  if (active.value) {
    selectElement()
  }
  
}

const selectElement = () => {
  const selectResult: SelectResult = {
    index: [],
    elements: [],
    event: moveEvent.value
  }
  const areaEl = areaRef.value
  selectElements.forEach((el, index) => {
    if(DOMUtils.isCollide(areaEl, el as HTMLElement)) {
      selectResult.elements.push(el as HTMLElement)
      selectResult.index.push(index)
    }
  })

  emits('selectMove', selectResult)

}

/**
 * 鼠标抬起事件，结束框选
 * @param e 鼠标事件
 */
const upHandler = (e: MouseEvent) => {
  window.removeEventListener('mousemove', moveHandler)
  scrollAnchorEl.value.removeEventListener('scroll', scrollHandler)
  scrollAnchorEl.value.classList.remove('relative-position')
  if (active.value) {
    e.stopImmediatePropagation()
    e.stopPropagation()
  }
  if (active.value) {
    emits('selectEnd')
  }
  active.value = false
  parentEl.value.appendChild(thisEl)
}

onMounted(() => {
  parentEl.value = getCurrentInstance()?.proxy?.$parent?.$el
  thisEl = getCurrentInstance()?.proxy?.$el
  window.addEventListener('mousedown', downHandler)
})

onUnmounted(() => {
  window.removeEventListener('mousedown', downHandler)
})
</script>

<script lang="ts">
import { SelectResult } from '@/core/model/component/SelectArea.js'
import DOMUtils from '@/utils/DOMUtils'
import { computed, defineComponent, getCurrentInstance, onMounted, onUnmounted, PropType, reactive, Ref, ref } from 'vue'

export default defineComponent({
  name: 'SelectArea'
})
</script>


<style lang="scss" scoped>
.select-area {
  position: absolute;
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

<style>
.relative-position {
  position: relative !important;
}
</style>