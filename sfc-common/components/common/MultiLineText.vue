<template>
  <div>
    <div v-for="(line, index) in text.split('\n')" :key="index">
      <span v-if="line">{{ line }}</span>
      <br v-else>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  text: {
    type: String,
    default: ''
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'MultiLineText'
})
</script>