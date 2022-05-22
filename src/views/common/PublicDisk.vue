<template>
  <div>
    <file-browser :uid="0" path="/" />
  </div>
</template>
<script setup lang="ts">
import FileBrowser from '@/components/common/FileBrowser.vue'
</script>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PublicDisk'
})
</script>