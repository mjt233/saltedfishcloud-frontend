<template>
  <div ref="rootRef">
    <file-menu :container="$el" :menu="menu" :list-context="fileListContext" />
    <v-table theme="background" class="file-table" :style="{'--table-width': tableWidth}">
      <thead>
        <tr>
          <th>文件名</th>
        </tr>
      </thead>
      <tbody>
        <tr @click="emits('back')">
          <td colspan="100">
            <div class="file-icon-group">
              <v-icon class="d-flex back-icon" icon="mdi-keyboard-backspace" />
              <span>返回上一级</span>
            </div> 
          </td>
        </tr>
        <tr
          v-for="(fileInfo, index) in fileList"
          :key="index"
          v-ripple
          @click="emits('clickItem', fileInfo)"
        >
          <td>
            <div class="file-icon-group">
              <file-icon
                width="32"
                height="32"
                :file-name="fileInfo.name"
                :is-dir="fileInfo.dir"
                :md5="fileInfo.md5"
              />
              <div class="file-detail">
                <div class="d-inline-block text-truncate file-name">
                  {{ fileInfo.name }}
                </div>
                <div>
                  <span class="file-size">{{ fileInfo.size == -1 ? '-': formatSize(fileInfo.size) }}</span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup lang="ts">
import FileMenu from './FileMenu.vue'
import FileIcon from './FileIcon.vue'
import { StringFormatter } from '@/utils/StringFormatter'

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
const tableWidth = ref('100%')
const rootRef = ref()

const updateWidth = () => {
  const el = rootRef.value as HTMLElement
  tableWidth.value = el.clientWidth + 'px'
}

const formatSize = (size: number) => {
  return StringFormatter.toSize(size)
}
defineExpose(fileListContext.modelHandler)
onMounted(() => {
  window.addEventListener('resize', updateWidth)
  updateWidth()
})
onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
})
</script>

<script lang="ts">
import { FileSystemHandler } from '@/core/serivce/FileSystemHandler'
import { FileInfo } from '@/core/model'
import { FileListContext } from '@/core/model'
import { defineExpose ,defineComponent, Ref, reactive, PropType, inject, watch, getCurrentInstance, ref, onMounted, onUnmounted } from 'vue'
import { MenuGroup } from '@/core/context'

export default defineComponent({
  name: 'FileList'
})
</script>


<style lang="scss" scoped>

.file-table {
  max-width: 100%;
  background-color: var(--v-theme-background);
  color: var(--v-theme-surface);
  --table-width: 100%;

  tr {
    cursor: pointer;
    max-width: 90%;
    &:hover,&.active {
      background-color: rgba($color: var(--v-theme-primary), $alpha: .02) !important;

      .file-name {
        color: rgba($color: var(--v-theme-primary), $alpha: 1.0) !important;
      }
    }

    td {
      font-size: 13px !important;
    }
  }
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

  
  .file-detail {
    display: flex;
    flex-direction: column;
    justify-content: left;
    margin-left: 6px;
  }
  .file-name {
    font-size: 14px;
    max-width: calc( var(--table-width) - 72px );
  }
}



.back-icon {
  font-size: 18px;
  height: 32px;
  width: 32px;
  display: inline-block;
}
</style>