<template>
  <div ref="rootRef" @contextmenu="rootRClick" @click="rootLClick">
    <file-menu :container="$el" :menu="menu" :list-context="fileListContext" />
    <v-table
      fixed-header
      class="file-table"
      :style="{'--table-width': tableWidth}"
      :height="height"
    >
      <thead>
        <tr>
          <th class="file-checkbox" style="background-color: rgb(var(--v-theme-background)); z-index: 1;" width="32" />
          <th style="background-color: rgb(var(--v-theme-background)); z-index: 1;">
            文件名
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td @click="toggleSelectAll">
            <v-checkbox
              color="primary"
              hide-details
              :indeterminate="partInSelect"
              :model-value="allInSelect || partInSelect"
            />  
          </td>
          <td colspan="100" @click="emits('back')">
            <div class="file-icon-group">
              <v-icon class="d-flex back-icon" icon="mdi-keyboard-backspace" />
              <span>返回上一级</span>
            </div>
          </td>
        </tr>
        <tr
          v-for="(fileInfo) in fileList"
          :key="fileInfo.name + fileInfo.md5"
          v-ripple
          :class="{active: selectedFile[fileInfo.name + fileInfo.md5]}"
          @contextmenu.prevent="fileRClick($event, fileInfo)"
        >
          <td class="file-checkbox" @click="checkClick($event ,fileInfo)">
            <v-checkbox hide-details color="primary" :model-value="!!selectedFile[fileInfo.name + fileInfo.md5]" />
          </td>
          <td @click="fileLClick($event, fileInfo)">
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
                  <span v-if="renameKey != fileInfo.name + fileInfo.md5"> {{ fileInfo.name }}</span>
                  <span v-else @click.stop> <input v-model="renameNewName" class="rename-input"> </span>
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
  },
  height: {
    type: Number,
    default: undefined
  }
})
let lastClickFile: FileInfo | null | boolean = null
const selectedFile = reactive({}) as {[key:string]: FileInfo}
const renameKey = ref('')
const renameNewName = ref('')
const partInSelect = computed(() => {
  return fileListContext.selectFileList.length > 0 && fileListContext.selectFileList.length != props.fileList.length
})
const allInSelect = computed(() => {
  return props.fileList.length != 0 && props.fileList.length == fileListContext.selectFileList.length
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
    },

    async rename(name, md5) {
      resetSelect()
      renameKey.value = name + md5
      renameNewName.value = name
      return name
    }
  }
})

const toggleSelectAll = () => {
  lastClickFile = true
  if (partInSelect.value || !allInSelect.value) {
    setSelectFile(...props.fileList)
  } else {
    setSelectFile()
  }
}
const checkClick = (e: MouseEvent, fileInfo: FileInfo) => {
  lastClickFile = fileInfo
  toggleSelectFile(fileInfo)
}
const rootLClick = (e: MouseEvent) => {
  if (!lastClickFile && !e.ctrlKey) {
    resetSelect()
  }
  lastClickFile = null
}
/**
 * 整个组件的右键/打开菜单事件
 */
const rootRClick = () => {
  // 如果是在文件项目上触发的事件，则清除标志位，否则重置已选择文件
  if (lastClickFile) {
    lastClickFile = null
  } else {
    resetSelect()
  }
}
/**
 * 文件项的右键/打开菜单事件
 * 会和rootClick一起触发，且会先于rootClick。
 * 通过设置lastClickFile属性来让rootClick判断是否是点击了文件项。
 */
const fileRClick = (e: MouseEvent, fileInfo: FileInfo) => {
  lastClickFile = fileInfo
  if(!selectedFile[fileInfo.name + fileInfo.md5] && !e.ctrlKey) {
    setSelectFile(fileInfo)
  }
  
}
const fileLClick = (e: MouseEvent, fileInfo: FileInfo) => {
  if (e.ctrlKey) {
    toggleSelectFile(fileInfo)
  } else {
    emits('clickItem', fileInfo)
  }
  
}
const setSelectFile = (...fileInfos: FileInfo[]) => {
  resetSelect()
  fileInfos.forEach(fileInfo => {
    const key = fileInfo.name + fileInfo.md5
    selectedFile[key] = fileInfo
  })
}
const toggleSelectFile = (...fileInfos: FileInfo[]) => {
  fileInfos.forEach(fileInfo => {
    const key = fileInfo.name + fileInfo.md5
    if (selectedFile[key]) {
      delete selectedFile[key]
    } else {
      selectedFile[key] = fileInfo
    }
  })
}
const resetSelect = () => {
  Object.keys(selectedFile).forEach(key => {
    delete selectedFile[key]
  })
}
const tableWidth = ref('100%')
const rootRef = ref()

const updateWidth = () => {
  const el = rootRef.value as HTMLElement
  tableWidth.value = el.clientWidth + 'px'
}

const formatSize = (size: number) => {
  return StringFormatter.toSize(size)
}
watch(() => props.readOnly, () => {
  fileListContext.readonly = props.readOnly
})

watch(() => props.fileList, () => {
  fileListContext.fileList = props.fileList
  resetSelect()
  renameKey.value = ''
})
watch(selectedFile, () => {
  fileListContext.selectFileList = Object.values(selectedFile)
})

onMounted(() => {
  window.addEventListener('resize', updateWidth)
  updateWidth()
})
onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
})
defineExpose(fileListContext.modelHandler)
</script>

<script lang="ts">
import { FileSystemHandler } from '@/core/serivce/FileSystemHandler'
import { FileListContext,FileInfo } from '@/core/model'
import { defineExpose ,defineComponent, Ref, reactive, PropType, inject, watch, getCurrentInstance, ref, onMounted, onUnmounted, computed } from 'vue'
import { MenuGroup } from '@/core/context'

export default defineComponent({
  name: 'FileList'
})
</script>


<style lang="scss" scoped>
.file-checkbox {
  padding-right: 0px !important;
}
.file-table {
  max-width: 100%;
  background-color: var(--v-theme-background);
  color: var(--v-theme-surface);
  --table-width: 100%;

  tr {
    cursor: pointer;
    max-width: 90%;
    transition: all .1s;
    &:hover {
      background-color: rgba($color: var(--v-theme-primary), $alpha: .08) !important;

      .file-name {
        color: rgba($color: var(--v-theme-primary), $alpha: 1.0) !important;
      }
    }
    &.active {
      background-color: rgba($color: var(--v-theme-primary), $alpha: .2) !important;

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

.rename-input {
  border: 1px solid rgb(var(--v-theme-primary));
  outline: none;
}


.back-icon {
  font-size: 18px;
  height: 32px;
  width: 32px;
  display: inline-block;
}
</style>