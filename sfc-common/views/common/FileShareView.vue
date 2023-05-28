<template>
  <base-view max-width="1920px" style="min-height: 300px">
    <file-share-extractor v-model:path="path" :sid="sid" :vid="vid" />
  </base-view>
</template>

<script setup lang="ts">
import FileShareExtractor from 'sfc-common/components/common/FileShare/extract/FileShareExtractor.vue'
import BaseView from 'sfc-common/components/common/BaseView.vue'

const path = ref('/')
const {sid = '', vid = '', paths = []} = context.routeInfo.value.curr?.params as any

provide('hrefReplacer', (href: string) => {
  if (href.startsWith('.')) {
    return StringUtils.resolveUrlRelativePath(StringUtils.appendPath(`/#/s/${sid}/${vid}`, path.value), href)
  } else {
    return href
  }
})

path.value = '/' + (paths || []).join('/')

watch(path, () => {
  context.routeInfo.value.router?.replace(StringUtils.appendPath(`/s/${sid}/${vid}/`, path.value.substring(1)))
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, watch, provide } from 'vue'
import { context } from 'sfc-common/core/context'
import { StringUtils } from 'sfc-common/utils'
import SfcUtils from 'sfc-common/utils/SfcUtils'

export default defineComponent({
  name: 'FileShareView'
})
</script>