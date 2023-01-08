<template>
  <v-col :class="{'top-label':topLabel}">
    <span v-if="label" class="form-label tip">
      <span v-if="required" style="color: red">*</span>
      {{ label }}
      <template v-if="!topLabel">:</template>
    </span>
    <slot />
  </v-col>
</template>

<script setup lang="ts">
const props = defineProps({
  /**
   * 标签
   */
  label: {
    type: String,
    default: ''
  },
  /**
   * 是否使用顶部标签样式
   */
  topLabel: {
    type: [Boolean, String],
    default: false
  },
  /**
   * 标签间隔，优先级高于form-grid中的定义
   */
  labelGap: {
    type: String,
    default: undefined
  },
  /**
   * 是否为必填项
   */
  required: {
    type: [Boolean, String],
    default: false
  }
})
const injectLabelGap:Ref<string> = inject('labelGap', ref('-3px'))
const cLabelGap = computed(() => {
  return props.labelGap || injectLabelGap.value
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, inject, computed } from 'vue'

export default defineComponent({
  name: 'FormCol'
})
</script>

<style lang="scss" scoped>
.form-label {
  margin-right: 6px;
  font-size: 14px;
}
.top-label {
  position: relative;
  .form-label {
    position: absolute;
    top: v-bind(cLabelGap);
    left: 12px;
  }
}
</style>