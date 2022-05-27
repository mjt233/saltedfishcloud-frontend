<template>
  <div>
    <ul class="file-list">
      <li v-show="showBack" @click="emits('back')">
        back
      </li>
      <li v-for="fileInfo in fileList" :key="fileInfo.name + fileInfo.md5" @click="emits('clickItem', fileInfo)">
        {{ fileInfo.name }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  readOnly: {
    type: Boolean,
    default: true
  },
  fileList: {
    type: Array as PropType<FileInfo[]>,
    default: () => []
  },
  showBack: {
    type: Boolean,
    default: true
  }

})

const fileListContext: FileListContext = reactive({
  fileList: [] as FileInfo[],
  enableFeature: [''],
  readonly: true,
  name: '',
  selectFileList: []
})
const componentInst: Ref<ComponentPublicInstance | undefined> = ref()
onMounted(() => {
  const inst = (getCurrentInstance()?.proxy) as ComponentPublicInstance & FileListModel
  fileListContext.el = inst
})

const fileListModelHandler: FileListModelHandler = {
  async mkdir() {
    console.log('mkdir')
    return ''
  },

  async upload() {
    return await FileUtils.openFileDialog(true)
  },

  async loadList() {
    return []
  }
}
const emits = defineEmits<{
  (event: 'clickItem', item: FileInfo): void,
  (event: 'back'): void
}>()

defineExpose(fileListModelHandler)
</script>

<script lang="ts">
import { FileListModel, FileListModelHandler } from '@/core/model/component/FileListModel'
import { FileInfo } from '@/core/model'
import { FileListContext } from '@/core/model'
import { defineComponent, ref, Ref, onMounted, getCurrentInstance,ComponentPublicInstance, reactive, PropType, inject } from 'vue'
import { context } from '@/core/context'
import API from '@/api'
import FileUtils from '@/utils/FileUtils'

export default defineComponent({
  name: 'FileList'
})
</script>


<style>
.file-list {
  padding: 0;
  list-style: none;
}
</style>