<template>
  <div>
    <file-browser v-model:path="path" :file-system-handler="handler" :read-only="readOnly" />
  </div>
</template>
<script setup lang="ts">
import FileBrowser from '@/components/common/FileBrowser.vue'
import { context } from '@/core/context'
import { FileSystemHandlerFactory } from '@/core/serivce/FileSystemHandler'
const readOnly = computed(() => {
  const r = context.session.value.user.role != 'admin'
  return r
})
const path = ref('/')
const handler = computed(() => {
  return FileSystemHandlerFactory.getFileSystemHandler(ref(0))
})
</script>
<script lang="ts">
import { computed, defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'PublicDisk'
})
</script>