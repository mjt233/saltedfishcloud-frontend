<template>
  <div class="loading-mask" :class="{loading:inLoading, 'flex-center': type == 'circular'}">
    <transition name="fade">
      <v-progress-linear
        v-show="type == 'linear' && inLoading"
        indeterminate
        color="primary"
      />
    </transition>
    <transition name="fade">
      <v-progress-circular
        v-show="type == 'circular' && inLoading"
        indeterminate
        color="primary"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  /**
   * 进度条类型：linear或circular
   */
  type: {
    type: String,
    default: 'linear'
  },
  loading: {
    type: Boolean,
    default: false
  }
})


const loadCount = ref(0)
const inLoading = computed(() => {
  return loadCount.value > 0 || props.loading
})
const startLoading = () => {
  loadCount.value++
}

const closeLoading = () => {
  if (loadCount.value > 0) {
    loadCount.value--
  }
}
defineExpose({
  startLoading,
  closeLoading
})
</script>

<script lang="ts">
import { defineComponent, defineProps, ref, } from 'vue'
import { context } from '@/core/context'
import { computed } from '@vue/reactivity'

export default defineComponent({
  name: 'LoadingMask'
})
</script>

<style scoped>
.loading-mask {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: rgba(223, 223, 223, 0);
  z-index: 9999;
  overflow: hidden;
  pointer-events: none;
  transition: all .5s;
}

.loading-mask.loading {
  background-color: rgba(255, 255, 255, 0.548);
  pointer-events: all;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>