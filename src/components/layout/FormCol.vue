<template>
  <v-col :class="{'top-label':topLabel}">
    <span v-if="label" class="form-label">{{ label }}:</span>
    <slot />
  </v-col>
</template>

<script setup lang="ts">
const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  topLabel: {
    type: [Boolean, String],
    default: false
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

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
    top: 14px;
  }
}
</style>