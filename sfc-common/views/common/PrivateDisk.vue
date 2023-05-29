<template>
  <!-- 当前未登录时，session的uid为0，此时传入一个非0的数字进去，user-file-browser内部中会因为出现游客访问私人网盘而出现登录提示 -->
  <user-file-browser
    v-model:path="path"
    use-drop-upload
    :uid="session.user.id || 114514"
    preview-readme
  />
</template>

<script setup lang="ts">
import UserFileBrowser from 'sfc-common/components/common/UserFileBrowser.vue'
const session = context.session

const path = ref('/')

// 根据路由设定初始路径
const pathParams = context.routeInfo.value.curr?.params.path as string[] | undefined
if (pathParams) {
  const initPath = '/' + pathParams.join('/')
  path.value = initPath
}

const updateUrl = () => {
  context.routeInfo.value.router?.replace(StringUtils.appendPath('/private', path.value.substring(1)))
}
watch(path, () => {
  updateUrl()
})
</script>

<script lang="ts">
import { context } from 'sfc-common/core/context'
import { computed, defineComponent, onMounted, Ref, ref, watch } from 'vue'
import { StringUtils } from 'sfc-common/utils/StringUtils'
export default defineComponent({
  name: 'PrivateDisk'
})
</script>