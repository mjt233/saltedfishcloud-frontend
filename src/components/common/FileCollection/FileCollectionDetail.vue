<template>
  <div>
    <h1>Hello World</h1>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  cid: {
    type: Number,
    default: 0
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'FileCollectionDetail'
})
</script>