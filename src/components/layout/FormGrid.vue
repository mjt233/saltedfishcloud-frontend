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
  dense: {
    type: Boolean,
    default: false
  },
  labelWidth: {
    type: String,
    default: '96px'
  },
  rowHeight: {
    type: String,
    default: '48px'
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

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