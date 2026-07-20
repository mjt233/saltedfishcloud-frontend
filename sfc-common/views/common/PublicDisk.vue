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
const pathParams = getContext().routeInfo.value.curr?.params.path as string[] | undefined
if (pathParams) {
  const initPath = '/' + pathParams.join('/')
  path.value = initPath
}

const updateUrl = () => {
  const target = StringUtils.appendPath('/public', path.value.substring(1))
  // 避免 Vue Router 冗余导航错误：当目标路径与当前路由相同时跳过
  if (getContext().routeInfo.value.curr?.path !== target) {
    getContext().routeInfo.value.router?.replace(target)
  }
}
watch(path, () => {
  updateUrl()
})

// 监听路由参数变化（如通过 AI 工具导航到新路径），同步更新 path
watch(
  () => getContext().routeInfo.value.curr?.params.path as string[] | undefined,
  (newPathParams) => {
    if (newPathParams && newPathParams.length > 0) {
      path.value = '/' + newPathParams.join('/')
    } else {
      path.value = '/'
    }
  }
)
</script>
<script lang="ts">
import { getContext } from 'sfc-common/core/context'
import { StringUtils } from 'sfc-common/utils/StringUtils'
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'PublicDisk'
})
</script>