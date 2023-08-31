<template>
  <div
    class="base-form form-grid"
    :class="{'dense-form': dense}"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  /**
   * 是否为紧凑表单
   */
  dense: {
    type: Boolean,
    default: false
  },
  /**
   * 标签宽度
   */
  labelWidth: {
    type: String,
    default: '96px'
  },
  /**
   * 标签与表单组件的间隔
   */
  labelGap: {
    type: String,
    default: '6px'
  },
  /**
   * 表单行高
   */
  rowHeight: {
    type: String,
    default: '48px'
  }
})
provide('labelGap', computed(() => props.labelGap))
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, provide, computed } from 'vue'

export default defineComponent({
  name: 'FormGrid'
})
</script>

<style scoped>
.form-grid {
  --form-label-width: v-bind(labelWidth);
  --row-height: v-bind(rowHeight)
}
</style>