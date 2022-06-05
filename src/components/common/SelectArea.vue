<template>
  <div class="select-area" :style="{top: (areaTop + offsetTop) + 'px', left: (areaLeft + offsetLeft) + 'px'}" />
</template>

<script setup lang="ts">
const props = defineProps({
  offsetTop: {
    type: Number,
    default: 0
  },
  offsetLeft: {
    type: Number,
    default: 0
  }
})
const areaLeft = ref(0)
const areaTop = ref(0)
let parentEl: HTMLElement
let parentLeft : number
let parentTop : number
let downEvent : MouseEvent
let downX: number
let downY: number

const downHandler = (e: MouseEvent) => {
  downEvent = e
  parentLeft = parentEl.getBoundingClientRect().left
  parentTop = parentEl.getBoundingClientRect().top - DOMUtils.getAbsoluteOffsetTop(parentEl, document.body)
  downX = e.clientX
  downY = e.clientY + parentEl.scrollTop
  window.addEventListener('mousemove', moveHandler)
  window.addEventListener('mouseup', upHandler)
}

const moveHandler = (e: MouseEvent) => {
  const width = downX - e.clientX
  const height = downY - e.clientY
  console.log(parentEl.scrollTop)
  // areaLeft.value = e.clientX - parentLeft
  // areaTop.value = e.clientY - parentTop
}
const upHandler = (e: MouseEvent) => {
  window.removeEventListener('mousemove', moveHandler)
}

onMounted(() => {
  parentEl = getCurrentInstance()?.proxy?.$parent?.$el || document.body
  window.addEventListener('mousedown', downHandler)
})

onUnmounted(() => {
  window.removeEventListener('mousedown', downHandler)
})
</script>

<script lang="ts">
import { defineComponent, getCurrentInstance, onMounted, onUnmounted, ref } from 'vue'
import { context } from '@/core/context'
import DOMUtils from '@/utils/DOMUtils'

export default defineComponent({
  name: 'SelectArea'
})
</script>


<style scoped>
.select-area {
  position: absolute;
  width: 120px;
  height: 120px;
  top: 0;
  left: 0;
  background-color: rgba(var(--v-theme-primary), .6);
  border: 1px solid  rgba(var(--v-theme-primary));
  z-index: 100;
}
</style>