<template>
  <v-col class="form-col" :class="{'form-col-top-label': topLabel}">
    <span v-if="label || $slots.label " class="form-label tip">
      <slot name="label">
        <span v-if="required" style="color: red">*</span>
        {{ `${label}${topLabel ? '' : ':'}` }}
      </slot>
    </span>
    <div class="form-col-content">
      <slot />
    </div>
    
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
    default: true
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
const injectLabelGap:Ref<string> = inject('labelGap', ref('6px'))
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
  max-width: var(--form-label-width);
  min-width: var(--form-label-width);
}

.form-col-top-label {
  position: relative;
  flex-direction: column;
  align-items: flex-start;
  justify-content: start;
  .form-label {
    display: block;
    max-width: 100%;
  }
}

.form-col-content {
  width: 100%;
}
</style>

<style lang="scss">
.form-col {
  display: flex;
  align-items: center;
  min-width: 280px;
  flex-direction: row;
  min-height: var(--row-height);
  padding: 0 12px;
}
</style>