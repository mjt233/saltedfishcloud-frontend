<template>
  <div style="padding: 6px">
    <loading-mask :loading="loading" />
    <grid-container gap="12px" :width="360">
      <file-collection-item v-for="(item, index) in collectionList" :key="index" :item="item" />
    </grid-container>
  </div>
</template>

<script setup lang="ts">
import LoadingMask from '../LoadingMask.vue'
import GridContainer from '@/components/layout/GridContainer.vue'
import FileCollectionItem from './FileCollectionItem.vue'
const props = defineProps({
  uid: {
    type: Number,
    default: 0
  }
})
const collectionList:Ref<CollectionInfo[]> = ref([])
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()
const actions = MethodInterceptor.createAsyncActionProxy({
  async loadList() {
    collectionList.value = (await SfcUtils.request(API.collection.getCreated())).data
  }
}, false, loadingManager)
actions.loadList()
</script>

<script lang="ts">
import { CollectionInfo } from '@/api/collection'
import SfcUtils from '@/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import API from '@/api'
import { MethodInterceptor } from '@/utils/MethodInterceptor'
import { LoadingManager } from '@/utils/LoadingManager'
export default defineComponent({
  name: 'FileCollectionView'
})
</script>