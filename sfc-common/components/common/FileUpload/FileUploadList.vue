<template>
  <empty-tip v-if="!uploadInfoList || uploadInfoList.length == 0" />
  <v-list v-else bg-color="background">
    <v-list-item
      v-for="(item, index) in uploadInfoList"
      :key="index"
      link
    >
      <file-upload-item :upload-info="item" :show-close="showClose" @close="emits('close', index)" />
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import EmptyTip from '../EmptyTip.vue'
import FileUploadItem from './FileUploadItem.vue'
import { FileUploadInfo } from 'sfc-common/core/serivce/FileUpload'
const props = defineProps({
  uploadInfoList: {
    type: Array as PropType<FileUploadInfo[]>,
    default: () => []
  },
  showClose: {
    type: Boolean,
    default: true
  }
})
const emits = defineEmits(['close'])

</script>

<script lang="ts">
import { defineComponent, defineProps, PropType } from 'vue'

export default defineComponent({
  name: 'FileUploadList'
})
</script>