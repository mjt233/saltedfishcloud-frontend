<template>
  <div>
    <file-browser
      v-model:path="path"
      :file-system-handler="handler"
      :read-only="readOnly"
      :uid="0"
      :top-buttons="context.menu.value.fileBrowserBtn"
    />
  </div>
</template>
<script setup lang="ts">
import FileBrowser from '@/components/common/FileBrowser.vue'
const readOnly = computed(() => {
  const r = context.session.value.user.role != 'admin'
  return r
})
const path = ref('/')
const handler = computed(() => {
  return FileSystemHandlerFactory.getFileSystemHandler(ref(0))
});


// 根据路由设定初始路径
(() => {
  const pathParams = context.routeInfo.value.curr?.params.path as string[] | undefined
  if (pathParams) {
    const initPath = '/' + pathParams.join('/')
    path.value = initPath
  }
})()

const updateUrl = () => {
  context.routeInfo.value.router?.replace(StringUtils.appendPath('/public', path.value.substring(1)))
}
watch(path, () => {
  updateUrl()
})
</script>
<script lang="ts">
import { context } from '@/core/context'
import { FileSystemHandlerFactory } from '@/core/serivce/FileSystemHandler'
import { StringUtils } from '@/utils/StringUtils'
import { computed, defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'PublicDisk'
})
</script>