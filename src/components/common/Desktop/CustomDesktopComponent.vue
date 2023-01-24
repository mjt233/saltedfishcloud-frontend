<!-- eslint-disable vue/no-v-html -->
<template>
  <component
    :is="tag"
    v-bind="$attrs"
    v-if="slotHtml"
    v-html="slotHtml"
  />
  <component :is="tag" v-else v-bind="$attrs" />
</template>

<script setup lang="ts">
const props = defineProps({
  tag: {
    type: String,
    default: 'div'
  },
  slotHtml: {
    type: String,
    default: undefined
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'

export default defineComponent({
  name: 'CustomDesktopComponent'
})
</script>