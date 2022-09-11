<template>
  <div class="base-view">
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  type: {
    type: String as PropType<'card' | 'fill'>,
    default: 'card'
  },
  maxWidth: {
    type: String,
    default: '480px'
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'BaseView'
})
</script>

<style lang="scss" scoped>
.base-view {
  max-width: v-bind(maxWidth);
  width: calc(100% - 12px);
  margin: 0 auto;
}
</style>