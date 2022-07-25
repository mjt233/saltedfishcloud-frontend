<template>
  <base-view max-width="720px">
    <file-collection-submit-form :cid="cid" :vid="vid" />
  </base-view>
  
</template>

<script setup lang="ts">
import FileCollectionSubmitForm from '@/components/common/FileCollection/form/FileCollectionSubmitForm.vue'
import { context } from '@/core/context'
import BaseView from '@/components/common/BaseView.vue'
const {cid, vid} = context.routeInfo.value.curr?.params as any
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'CollectionSubmitView'
})
</script>