<template>
  <div class="anchor">
    <div ref="content" class="inner-content" :class="contentClass + (stickActive ? ' at-top' : ' ')">
      <slot />
    </div>
    <div class="empty-padding" :style="{height: (stickActive ? (content?.clientHeight || 0) : 0) + 'px'}" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  top: {
    type: Number,
    default: 0
  },
  /**
   * 是否监听整条DOM路径
   */
  listenFullPath: {
    type: Boolean,
    default: false
  },
  /**
   * 包裹默认插槽的父级div class
   */
  contentClass: {
    type: String,
    default: ''
  },
  /**
   * 触发吸顶效果时的top坐标
   */
  triggerTop: {
    type: Number,
    default: undefined
  }
})
const parentElements: HTMLElement[] = []
let currentElement: HTMLElement
const stickActive = ref(false)
const content = ref() as Ref<HTMLElement>
const triggerTopVal = computed(() => {
  return props.triggerTop === undefined ? props.top : props.triggerTop
})
const scrollHandler = (e: Event) => {
  if(currentElement.getBoundingClientRect().top <= triggerTopVal.value) {
    stickActive.value = true
  } else {
    stickActive.value = false
  }
}
const topPx = computed(() => {
  return props.top + 'px'
})
let isFullPath = false
onMounted(() => {
  isFullPath = props.listenFullPath

  if (isFullPath) {
    let el = getCurrentInstance()?.proxy?.$el as HTMLElement
    while(el != null) {
      parentElements.push(el)
      el = el.parentElement as HTMLElement
    }
  
    parentElements.forEach(e => {
      e.addEventListener('scroll', scrollHandler)
    })
  }
  window.addEventListener('scroll', scrollHandler)
  currentElement = getCurrentInstance()?.proxy?.$el as HTMLElement
})

onUnmounted(() => {
  if (isFullPath) {
    parentElements.forEach(e => {
      e.removeEventListener('scroll', scrollHandler)
    })
  }
  
  window.removeEventListener('scroll', scrollHandler)
})
const emits = defineEmits(['change'])
watch(stickActive, () => {
  emits('change', stickActive.value)
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted,getCurrentInstance, onUnmounted,computed, watch } from 'vue'

export default defineComponent({
  name: 'StickContainer'
})
</script>


<style scoped>
.at-top {
  position: fixed;
  top: v-bind(topPx);
  z-index: 666;
}
</style>
