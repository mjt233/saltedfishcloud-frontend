<template>
  <span>
    <template v-if="icon">
      <v-icon
        v-if="icon.startsWith('mdi-')"
        :color="props.color"
        :icon="icon"
        :style="size ? `font-size: ${size}px`: ''"
      />
      <img v-if="isUrl" :src="props.icon" :width="`${size}px`">
    </template>
    
  </span>
</template>

<script setup lang="ts">
const props = defineProps({
  icon: {
    type: String,
    default: undefined
  },
  color: {
    type: String,
    default: undefined
  },
  size: {
    type: [Number, String],
    default: undefined
  }
})
const isUrl = computed(() => {
  if(!props.icon || props.icon.startsWith('mdi-')) {
    return false
  }
  return props.icon.startsWith('http') || props.icon.startsWith('data:')
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed } from 'vue'

export default defineComponent({
  name: 'CommonIcon'
})
</script>