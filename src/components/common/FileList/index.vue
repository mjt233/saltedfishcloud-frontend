<template>
  <div ref="rootRef" @contextmenu="rootRClick" @click="rootLClick">
    <file-menu
      :container="$el"
      :menu="menu"
      :list-context="fileListContext"
      :loading-manager="loadingManager"
    />
    <v-table
      v-if="type == 'list'"
      fixed-header
      class="file-table"
      color="background"
      :style="{'--table-width': tableWidth}"
      :height="height"
    >
      <thead>
        <tr>
          <th width="16" class="file-checkbox" @click="toggleSelectAll">
            <v-checkbox
              inline
              color="primary"
              hide-details
              :indeterminate="partInSelect"
              :model-value="allInSelect || partInSelect"
            />
          </th>
          <th class="file-col">
            文件名
          </th>
          <th width="128">
            大小
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td @click="toggleSelectAll">
            <v-checkbox
              inline
              color="primary"
              hide-details
              :indeterminate="partInSelect"
              :model-value="allInSelect || partInSelect"
            />  
          </td>
          <td colspan="100" class="file-col" @click="emits('back')">
            <div class="file-icon-group">
              <v-icon class="d-flex back-icon" icon="mdi-keyboard-backspace" />
              <span>返回上一级</span>
            </div>
          </td>
        </tr>
        <tr v-show="fileList.length == 0">
          <td colspan="100">
            <empty-tip />
          </td>
        </tr>
        <tr
          v-for="(fileInfo, index) in fileList"
          :key="fileInfo.name + fileInfo.md5"
          v-ripple
          :class="{active: selectedFile[fileInfo.name + fileInfo.md5]}"
          @contextmenu.prevent="fileRClick($event, fileInfo)"
        >
          <td class="file-checkbox" @click="checkClick($event ,fileInfo)">
            <v-checkbox
              inline
              hide-details
              color="primary"
              :model-value="!!selectedFile[fileInfo.name + fileInfo.md5]"
            />
          </td>
          <td class="file-col" @click="fileLClick($event, fileInfo)">
            <div class="file-icon-group">
              <file-icon
                width="32"
                height="32"
                style="flex-grow: 0;"
                :file-name="fileInfo.name"
                :is-dir="fileInfo.dir"
                :md5="fileInfo.md5"
              />
              <div class="file-detail">
                <div class="d-inline-block text-truncate file-name">
                  <span v-if="renameIndex != index">
                    {{ fileInfo.name }}
                  </span>
                  <div v-else @click.stop>
                    <input v-model="renameNewName" class="rename-input" @keypress.enter="doRename">
                    <v-icon icon="mdi-check" @click="doRename" />
                    <v-icon icon="mdi-close" @click="cancelRename" />
                  </div>
                </div>
                <div>
                  <span class="file-size">{{ fileInfo.size == -1 ? '-': formatSize(fileInfo.size) }}</span>
                </div>
              </div>
            </div>
          </td>
          <td>
            {{ fileInfo.size == -1 ? '-' : StringFormatter.toSize(fileInfo.size) }}
          </td>
        </tr>
      </tbody>
    </v-table>
    <grid-container v-else :width="120">
      <div v-for="(fileInfo, index) in fileList" :key="index" @contextmenu.prevent="fileRClick($event, fileInfo)">
        <file-list-grid-item v-ripple :file-info="fileInfo" />
      </div>
    </grid-container>
  </div>
</template>

<script setup lang="ts">
import FileMenu from '../FileMenu.vue'
import FileIcon from '../FileIcon.vue'
import propsOptions from './props'
import { StringFormatter } from '@/utils/StringFormatter'
import SfcUtils from '@/utils/SfcUtils'
import FileListContextBuilder from './FileListContextBuilder'
import { LoadingControlPromise } from '@/utils/LoadingManager'
import EmptyTip from '../EmptyTip.vue'
import GridContainer from '@/components/layout/GridContainer.vue'
import FileListGridItem from './FileListGridItem.vue'


const props = defineProps(propsOptions)

let lastClickFile: FileInfo | null | boolean = null
const selectedFile = reactive({}) as {[key:string]: FileInfo}
const renameNewName = ref('')
const renameIndex = ref(-1)
let renamePromiseResolve: ((value: string | PromiseLike<string>) => void) | null= null
let renamePromiseReject: ((value: string | PromiseLike<string>) => void) | null = null
const tableWidth = ref('100%')
const rootRef = ref() as Ref<HTMLElement>

const partInSelect = computed(() => {
  return fileListContext.selectFileList.length > 0 && fileListContext.selectFileList.length != props.fileList.length
})
const allInSelect = computed(() => {
  return props.fileList.length != 0 && props.fileList.length == fileListContext.selectFileList.length
})


const rename = (name: string, md5: string) => {
  resetSelect()
  renameIndex.value = props.fileList.findIndex(e => e.name == name && e.md5 == md5)
  renameNewName.value = name
  return new LoadingControlPromise<string>((resolve, reject) => {
    renamePromiseResolve = resolve
    renamePromiseReject = reject
    nextTick().then(() => {
      (rootRef.value.querySelector('.rename-input') as HTMLInputElement).select()
    })
  }, false)
}
const emits = defineEmits<{
  (event: 'clickItem', ctx: FileListContext ,item: FileInfo): void,
  (event: 'back'): void,
  (event: 'refresh'): void,
  (event: 'update:file-list', fileList: FileInfo[]): void
}>()

const handler = inject<Ref<FileSystemHandler>>('fileSystemHandler')
const fileListContext: FileListContext = FileListContextBuilder.getFileListContext({
  props,
  emits,
  rename,
  handler
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
const cancelRename = () => {
  renamePromiseReject && renamePromiseReject('重命名取消')
  renameIndex.value = -1
}
const doRename = async() => {
  const sameNameIndex = props.fileList.findIndex(e => e.name == renameNewName.value)
  
  // 如果在文件列表中找到文件名和新文件名相同
  if (sameNameIndex != -1) {

    // 同一个文件
    if (sameNameIndex == renameIndex.value) {
      renameIndex.value = -1
      renamePromiseResolve && renamePromiseResolve('')
      return false
    } else {

      // 其它文件存在同名
      renamePromiseReject && renamePromiseReject('存在同名文件')
      return Promise.reject()
    }
  }
  await handler?.value.rename(props.path, props.fileList[renameIndex.value].name, renameNewName.value)
  renameIndex.value = -1
  renamePromiseResolve && renamePromiseResolve(renameNewName.value)
}
/**
 * 整个组件的点击事件回调
 * @param e 鼠标事件
 */
const rootLClick = (e: MouseEvent) => {
  if (!lastClickFile && !e.ctrlKey) {
    resetSelect()
  }
  lastClickFile = null
  if (renameIndex.value != -1) {
    renameIndex.value = -1
    SfcUtils.snackbar('重命名已取消', 1000, {outClose: true})
  }
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
    emits('clickItem', fileListContext, fileInfo)
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

const updateWidth = () => {
  const el = rootRef.value as HTMLElement
  tableWidth.value = (el.clientWidth - 81)+ 'px'
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
})
watch(selectedFile, () => {
  fileListContext.selectFileList = Object.values(selectedFile)
})
watch(() => props.path, () => {
  fileListContext.path = props.path
})
watch(() => props.uid, () => {
  fileListContext.uid = props.uid
})

onMounted(() => {
  fileListContext.uid = props.uid
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
import { defineExpose ,defineComponent, Ref, reactive, PropType, inject, watch, getCurrentInstance, ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { MenuGroup } from '@/core/context'

export default defineComponent({
  name: 'FileList'
})
</script>


<style lang="scss" scoped>
@import './style.scss';
</style>