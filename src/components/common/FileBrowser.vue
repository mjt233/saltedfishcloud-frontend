<template>
  <div>
    <file-list :file-list="fileList" />
  </div>
</template>

<script setup lang="ts">
import FileList from './FileList.vue'
const session = context.session
const props = defineProps({
  uid: {
    type: Number,
    default: 0
  },
  path: {
    type: String,
    default: '/'
  }
})
const fileList: Ref<FileInfo[]> = ref([])

const loadList = async() => {
  const list = (await SfcUtils.request(API.file.getFileList(props.uid, props.path))).data.data
  fileList.value = list[0].concat(list[1])
}

onMounted(() => {
  loadList()
})
</script>

<script lang="ts">
import { FileInfo } from '@/core/model'
import API from '@/api'
import SfcUtils from '@/utils/SfcUtils'
import { defineComponent, ref, Ref, onMounted } from 'vue'
import { context } from '@/core/context'

export default defineComponent({
  name: 'FileBrowser'
})
</script>