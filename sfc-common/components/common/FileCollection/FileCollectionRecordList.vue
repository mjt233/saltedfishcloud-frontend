<template>
  <loading-mask :type="'circular'" :loading="loading" style="min-height: 180px" />
  <v-expansion-panels v-if="!isEmpty" class="panels" :style="{'max-height': records.length ? (records.length * 54.5 + 280 + 'px') : '0px'}">
    <file-collection-record v-for="(item, index) in records" :key="index" :item="item" />
  </v-expansion-panels>
  <empty-tip v-else />
</template>

<script setup lang="ts">
import EmptyTip from '../EmptyTip.vue'
import FileCollectionRecord from './FileCollectionRecord.vue'
import LoadingMask from '../LoadingMask.vue'
const props = defineProps({
  cid: {
    type: Number,
    default: 0
  }
})

const loading = ref(true)
const isEmpty = ref(false)
const records = ref([]) as Ref<CollectionRecord[]>
const loadList = async() => {
  try {
    loading.value = true
    const list = (await SfcUtils.request(
      API.collection.getRecords(props.cid || context.session.value.user.id, 1, 500)
    )).data

    records.value = list.data.content
    if (list.data.totalCount == 0) {
      isEmpty.value = true
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  setTimeout(() => {
    
    loadList()
  }, 100)
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'
import API from 'sfc-common/api'
import { context } from 'sfc-common/core/context'
import { CollectionRecord } from 'sfc-common/model/FileCollection'
import SfcUtils from 'sfc-common/utils/SfcUtils'

export default defineComponent({
  name: 'FileCollectionRecordList'
})
</script>

<style lang="scss" scoped>
.panels {
  max-height: 0px;
  padding: 16px;
  transition: all 1s;
  transition-timing-function: cubic-bezier(0.11, 0.65, 0.18, 0.91);
  overflow: hidden;
}
</style>