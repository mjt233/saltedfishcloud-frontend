<template>
  <div>
    <file-menu :container="$el" :menu="menu" :list-context="fileListContext" />
    <div class="file-list">
      <v-row v-show="showBack" @click="emits('back')">
        <v-col>
          back
        </v-col>
        
      </v-row>
      <v-row v-for="fileInfo in fileList" :key="fileInfo.name + fileInfo.md5" @click="emits('clickItem', fileInfo)">
        <v-col>
          <span class="file-icon-group">
            <file-icon
              width="32"
              height="32"
              :file-name="fileInfo.name"
              :md5="fileInfo.md5"
              :is-dir="fileInfo.dir"
            />
            <span>{{ fileInfo.name }}</span>
          </span>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import FileMenu from './FileMenu.vue'
import FileIcon from './FileIcon.vue'

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
  (event: 'refresh'): void,
  (event: 'update:file-list', fileList: FileInfo[]): void
}>()

const handler = inject<Ref<FileSystemHandler>>('fileSystemHandler')
const fileListContext: FileListContext = reactive({
  fileList: props.fileList,
  enableFeature: [''],
  readonly: props.readOnly,
  name: '',
  selectFileList: [],
  modelHandler: {
    async mkdir(name) {
      await handler?.value.mkdir(props.path, name)
      return name
    },

    async upload() {
      throw new Error('未实现')
    },

    async refresh() {
      const list = await handler?.value.loadList(props.path) as FileInfo[]
      emits('update:file-list', list)
      return list
    }
  }
})
watch(() => props.readOnly, () => {
  fileListContext.readonly = props.readOnly
})

watch(() => props.fileList, () => {
  fileListContext.fileList = props.fileList
})
defineExpose(fileListContext.modelHandler)
</script>

<script lang="ts">
import { FileSystemHandler } from '@/core/serivce/FileSystemHandler'
import { FileInfo } from '@/core/model'
import { FileListContext } from '@/core/model'
import { defineExpose ,defineComponent, Ref, reactive, PropType, inject, watch } from 'vue'
import { MenuGroup } from '@/core/context'

export default defineComponent({
  name: 'FileList'
})
</script>


<style lang="scss">
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

.file-icon-group {
  display: inline-flex;
  justify-content: center;
  align-items: center;

  span {
    margin-left: 6px;
  }
}
</style>