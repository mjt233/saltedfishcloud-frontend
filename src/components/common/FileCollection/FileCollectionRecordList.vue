<template>
  <v-expansion-panels>
    <file-collection-record v-for="(item, index) in records" :key="index" :item="item" />
  </v-expansion-panels>
</template>

<script setup lang="ts">
import FileCollectionRecord from './FileCollectionRecord.vue'
const props = defineProps({
  cid: {
    type: Number,
    default: 0
  }
})



const records = ref([]) as Ref<CollectionRecord[]>
const loadList = async() => {
  const list = (await SfcUtils.request(
    API.collection.getRecords(props.cid || context.session.value.user.id, 1, 500)
  )).data

  records.value = list.data.content
}

onMounted(() => {
  loadList()
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'
import API from '@/api'
import { context } from '@/core/context'
import { CollectionRecord } from '@/core/model/FileCollection'
import SfcUtils from '@/utils/SfcUtils'

export default defineComponent({
  name: 'FileCollectionRecordList'
})
</script>