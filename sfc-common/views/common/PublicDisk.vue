<template>
  <user-file-browser
    v-model:path="path"
    use-drop-upload
    :uid="0"
    preview-readme
  />
</template>


<script setup lang="ts">
import UserFileBrowser from 'sfc-common/components/common/UserFileBrowser.vue'


const path = ref('/')


// 根据路由设定初始路径
const pathParams = context.routeInfo.value.curr?.params.path as string[] | undefined
if (pathParams) {
  const initPath = '/' + pathParams.join('/')
  path.value = initPath
}

const updateUrl = () => {
  context.routeInfo.value.router?.replace(StringUtils.appendPath('/public', path.value.substring(1)))
}
watch(path, () => {
  updateUrl()
})
</script>
<script lang="ts">
import { context } from 'sfc-common/core/context'
import { StringUtils } from 'sfc-common/utils/StringUtils'
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'PublicDisk'
})
</script>