<template>
  <div>
    <file-menu :container="$el" :menu="menu" :context="fileListContext" />
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
import FileMenu from './FileMenu.vue'

// 基本属性定义
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
  },
  /**
   * 文件列表所处的路径
   */
  path: {
    type: String,
    default: '/'
  },
  menu: {
    type: Array as PropType<MenuGroup<FileListContext>[]>,
    default: () => []
  }
})
const emits = defineEmits<{
  (event: 'clickItem', item: FileInfo): void,
  (event: 'back'): void,
  (event: 'refresh'): void
}>()


const handler = inject<Ref<FileSystemHandler>>('fileSystemHandler')
const fileListContext: FileListContext = reactive({
  fileList: props.fileList,
  enableFeature: [''],
  readonly: true,
  name: '',
  selectFileList: [],
  modelHandler: {
    async mkdir() {
      throw new Error('未实现')
    },

    async upload() {
      throw new Error('未实现')
    },

    async refresh() {
      return handler?.value.loadList(props.path)
    }
  }
})

watch(() => props.fileList, () => {
  fileListContext.fileList = props.fileList
})
defineExpose(fileListContext.modelHandler)
</script>

<script lang="ts">
import { FileSystemHandler } from '@/core/serivce/FileSystemHandler'
import { FileListModel, FileListModelHandler } from '@/core/model/component/FileListModel'
import { FileInfo } from '@/core/model'
import { FileListContext } from '@/core/model'
import { defineExpose ,defineComponent, ref, Ref, onMounted, getCurrentInstance,ComponentPublicInstance, reactive, PropType, inject, watch } from 'vue'
import { context, MenuGroup } from '@/core/context'
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
.menu-anchor {
  width: 0 !important;
  height: 0 !important;
  /* display: none; */
  position: fixed;
}
</style>