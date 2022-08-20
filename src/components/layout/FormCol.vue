<template>
  <v-col>
    <span class="form-label">{{ label }}:</span>
    <slot />
  </v-col>
</template>

<script setup lang="ts">
const props = defineProps({
  label: {
    type: String,
    default: ''
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'FormCol'
})
</script>

<style scoped>
.form-label {
  margin-right: 6px;
  font-size: 14px;
}
</style>