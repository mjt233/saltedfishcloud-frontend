<template>
  <base-view max-width="960px" style="min-height: 300px">
    <file-share-extractor :sid="sid" :vid="vid" />
  </base-view>
</template>

<script setup lang="ts">
import FileShareExtractor from 'sfc-common/components/common/FileShare/extract/FileShareExtractor.vue'
import BaseView from 'sfc-common/components/common/BaseView.vue'

const {sid = '', vid = ''} = context.routeInfo.value.curr?.params as any
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { context } from 'sfc-common/core/context'

export default defineComponent({
  name: 'FileShareView'
})
</script>