<template>
  <v-icon icon="mdi-file" />
</template>

<script setup lang="ts">
const props = defineProps({
  fileName: {
    type: String,
    required: true
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'SimpleFileIcon'
})
</script>