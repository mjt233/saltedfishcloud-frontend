<template>
  <div class="fill-center">
    <slot />
  </div>
</template>

<script setup lang="ts">
const isSm = ref(false)
const isMd = ref(false)
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
  /**
   * 中屏尺寸下的元素宽度
   */
  mdWidth: {
    type: Number,
    default: undefined
  },
  type: {
    type: String as PropType<'around' | 'between' | 'evenly'>,
    default: 'evenly'
  },
  gap: {
    type: String,
    default: '10px'
  }
})

const itemWidth = ref()
const updateWidth = () => {
  console.log('update')
  const clientWidth = document.documentElement.clientWidth
  isSm.value = clientWidth <= 640
  isMd.value = clientWidth <= 1024

  itemWidth.value = props.width + 'px'
  if (isMd.value) {
    itemWidth.value = (props.mdWidth || props.width) + 'px'
  }
  if (isSm.value) {
    itemWidth.value = (props.smWidth || props.mdWidth || props.width) + 'px'
  }
}

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
  gap: v-bind('gap');
  grid-auto-rows: max-content;
}
</style>
