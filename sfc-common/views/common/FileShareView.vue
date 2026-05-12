<template>
  <base-view max-width="1920px" style="min-height: 300px">
    <file-share-extractor
      v-model:path="path"
      :sid="sid"
      :vid="vid"
      :extract-code="defaultExtractCode"
      class="mt-6"
    />
  </base-view>
</template>

<script setup lang="ts">
import FileShareExtractor from 'sfc-common/components/common/FileShare/extract/FileShareExtractor.vue'
import BaseView from 'sfc-common/components/common/BaseView.vue'

const path = ref('/')
const route = getContext().routeInfo.value.curr
const {sid = '', vid = '', paths = []} = route?.params as any

// 将 query 中的 code 统一归一成提取组件可直接使用的字符串。
const routeQueryCode = Array.isArray(route?.query.code) ? route?.query.code[0] : route?.query.code
const defaultExtractCode: string | undefined = routeQueryCode ?? undefined


provide('hrefReplacer', (href: string) => {
  if (href.startsWith('.')) {
    return StringUtils.resolveUrlRelativePath(StringUtils.appendPath(`/#/s/${sid}/${vid}`, path.value), href)
  } else {
    return href
  }
})

path.value = '/' + (paths || []).join('/')

watch(path, () => {
  getContext().routeInfo.value.router?.replace(StringUtils.appendPath(`/s/${sid}/${vid}/`, path.value.substring(1)))
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, watch, provide } from 'vue'
import { getContext } from 'sfc-common/core/context'
import { StringUtils } from 'sfc-common/utils'

export default defineComponent({
  name: 'FileShareView'
})
</script>