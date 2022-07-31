<template>
  <file-browser
    v-if="shareInfo?.type == 'DIR'"
    v-model:path="path"
    :file-system-handler="handler"
    :uid="shareInfo.uid"
    read-only
    auto-compute-height
    :enable-menu="['refresh', 'wrap']"
  />
</template>

<script setup lang="ts">
import FileBrowser from '../../FileBrowser.vue'
const props = defineProps({
  shareInfo: {
    type: Object as PropType<ShareInfo>,
    default: undefined
  }
})

const handler = computed(() => {
  console.log(props.shareInfo)
  return FileSystemHandlerFactory.getShareFileSystemhandler(props.shareInfo as ShareInfo)
})

const path = ref('/')
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed } from 'vue'
import { ShareInfo } from '@/api/share'
import { FileSystemHandlerFactory } from '@/core/serivce/FileSystemHandler'

export default defineComponent({
  name: 'FileShareDirBrowser'
})
</script>