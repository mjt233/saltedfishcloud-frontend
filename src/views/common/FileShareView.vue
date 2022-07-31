<template>
  <base-view max-width="960px">
    <file-share-extractor :sid="sid" :vid="vid" />
  </base-view>
</template>

<script setup lang="ts">
import FileShareExtractor from '@/components/common/FileShare/extract/FileShareExtractor.vue'
import BaseView from '@/components/common/BaseView.vue'

const {sid = '', vid = ''} = context.routeInfo.value.curr?.params as any
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { context } from '@/core/context'

export default defineComponent({
  name: 'FileShareView'
})
</script>