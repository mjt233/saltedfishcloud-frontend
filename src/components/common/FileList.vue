<template>
  <div>
    <ul class="file-list">
      <li v-for="fileInfo in fileList" :key="fileInfo.name + fileInfo.md5">
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
  }
})



const session = context.session

const fileListContext: FileListContext = reactive({
  fileList: [] as FileInfo[],
  enableFeature: [''],
  readonly: true,
  name: ''
})
const componentInst: Ref<ComponentPublicInstance | undefined> = ref()
onMounted(() => {
  const inst = (getCurrentInstance()?.proxy) as ComponentPublicInstance & FileListModel
  fileListContext.el = inst
})


defineEmits(['mkdir', 'upload'])

const mkdir = () => {
  console.log('mkdir')
}
const upload = () => {
  console.log('upload')
}
</script>

<script lang="ts">
import { FileListModel } from '@/core/model/component/FileListModel'
import { FileInfo } from '@/core/model'
import { FileListContext } from '@/core/model'
import { defineComponent, ref, Ref, onMounted, getCurrentInstance,ComponentPublicInstance, reactive, PropType } from 'vue'
import { context } from '@/core/context'
import API from '@/api'

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