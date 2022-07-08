<template>
  <div class="fill-center">
    <slot />
  </div>
</template>

<script setup lang="ts">
const isSm = ref(false)
const props = defineProps({
  /**
   * 元素宽度
   */
  width: {
    type: Number,
    default: 320
  },
  /**
   * 小屏尺寸下的元素宽度
   */
  smWidth: {
    type: Number,
    default: undefined
  },
  type: {
    type: String as PropType<'around' | 'between' | 'evenly'>,
    default: 'evenly'
  }
})

const updateWidth = () => {
  if (document.documentElement.clientWidth < 640) {
    isSm.value = true
  } else {
    isSm.value = false
  }
}
const itemWidth = computed(() => {
  if (isSm.value) {
    return (props.smWidth || props.width) + 'px'
  } else {
    return props.width + 'px'
  }
})
const justifyContent = computed(() => {
  return 'space-' + props.type
})
onMounted(() => {
  updateWidth()
  window.addEventListener('resize', updateWidth)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
})
</script>

<script lang="ts">
import { defineProps, defineComponent, ref, computed, onMounted, onUnmounted, PropType } from 'vue'
export default defineComponent({
  name: 'GridContainer'
})
</script>

<style scoped>
.fill-center {
  display: grid;
  grid-template-columns: repeat(auto-fill, v-bind(itemWidth));
  justify-content: v-bind(justifyContent);
  gap: 10px;
  grid-auto-rows: max-content;
}
</style>
