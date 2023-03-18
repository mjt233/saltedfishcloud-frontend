<template>
  <div>
    <file-share-list :uid="uid" />
  </div>
</template>

<script setup lang="ts">
import FileShareList from './FileShareList.vue'
provide('protocol', 'share')
const props = defineProps({
  uid: {
    type: Number,
    default: 0
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, inject, provide } from 'vue'

export default defineComponent({
  name: 'FileShareView'
})
</script>