<template>
  <div>
    <file-browser v-model:path="path" :uid="0" />
  </div>
</template>
<script setup lang="ts">
import FileBrowser from '@/components/common/FileBrowser.vue'
const path = ref('/')
</script>
<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'PublicDisk'
})
</script>