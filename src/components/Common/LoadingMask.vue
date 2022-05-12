<template>
  <v-row class="loading-mask" :class="{loading:loading, 'flex-center': type == 'circular'}" transition="fade-transition">
    <v-progress-linear v-show="type == 'linear' && loading" indeterminate color="primary" />
    <v-progress-circular
      v-show="type == 'circular' && loading"
      indeterminate
      color="primary"
    />
  </v-row>
</template>

<script setup lang="ts">
defineProps({
  /**
   * 进度条类型：linear或circular
   */
  type: {
    type: String,
    default: 'linear'
  }
})


const loadCount = ref(0)
const loading = computed(() => {
  return loadCount.value > 0
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