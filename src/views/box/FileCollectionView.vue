<template>
  <div>
    <p>Hello World</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'FileCollectionView'
})
</script>