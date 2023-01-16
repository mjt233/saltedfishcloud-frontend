<template>
  <div class="d-flex">
    <div
      ref="rootRef"
      style="flex: 1"
      @contextmenu="rootRClick"
      @click="rootLClick"
    >
      <!-- 鼠标框选组件 -->
      <select-area
        v-if="rootRef"
        :scroll-anchor="scrollAnchor"
        :select-elements-getter="fileElementsGetter"
        :click-trigger="rootRef"
        @select-start="selectStart"
        @select-move="selectMove"
      />
      <!-- 文件右键菜单组件 -->
      <file-menu
        v-if="menu.length > 0"
        :container="$el"
        :menu="menu"
        :list-context="fileListContext"
        :loading-manager="loadingManager"
      />
      <!-- list类型的文件列表显示 -->
      <v-table
        v-if="type == 'list'"
        ref="tableRef"
        class="file-table"
        style="overflow: hidden"
        :style="{'--table-width': tableWidth}"
        :height="height"
      >
        <thead style="background: none">
          <tr>
            <th
              v-if="useSelect"
              width="72"
              class="file-checkbox"
              style="background-color: transparent !important"
              @click="toggleSelectAll"
            >
              <v-checkbox
                inline
                color="primary"
                hide-details
                :indeterminate="partInSelect"
                :model-value="allInSelect || partInSelect"
              />
            </th>
            <th class="file-col" style="background-color: transparent !important">
              文件名
            </th>
            <!-- <th width="128">
            大小
          </th> -->
            <slot name="thead" />
          </tr>
        </thead>
        <tbody>
          <tr v-if="showBack">
            <td v-if="useSelect" class="file-checkbox" @click="toggleSelectAll">
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
            :key="path + fileInfo.name"
            v-ripple
            file-item
            :class="{active: selectedFile[fileInfo.name + fileInfo.md5]}"
            @contextmenu.prevent="fileRClick($event, fileInfo)"
          >
            <td v-if="useSelect" class="file-checkbox" @click="checkClick($event ,fileInfo)">
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
                  :corner-icon="showMountIcon && fileInfo.mountId ? 'mdi-share' : undefined"
                  style="flex-grow: 0;"
                  :file-name="fileInfo.name"
                  :is-dir="fileInfo.dir"
                  :md5="fileInfo.md5"
                  :custom-thumbnail-url="handler && handler.getCustomThumbnailUrl(path, fileInfo)"
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
            <!-- <td>
            {{ fileInfo.size == -1 ? '-' : StringFormatter.toSize(fileInfo.size) }}
          </td> -->
            <slot name="tbody" :file-info="fileInfo" />
          </tr>
        </tbody>
      </v-table>
      <empty-tip v-if="type == 'grid' && fileList.length == 0" style="position: absolute;width: 100%;" />
      <!-- grid类型的文件显示 -->
      <grid-container
        v-if="type == 'grid'"
        ref="gridRef"
        :width="120"
        class="grid-container"
      >
        <file-list-grid-item
          v-for="(fileInfo) in fileList"
          :key="path + fileInfo.name + fileInfo.md5"
          ref="gridItemRef"
          v-ripple
          :file-info="fileInfo"
          :corner-icon="showMountIcon && fileInfo.mountId ? 'mdi-share' : undefined"
          :active="!!selectedFile[fileInfo.name + fileInfo.md5]"
          :path="path"
          @click="fileLClick($event, fileInfo)"
          @contextmenu.prevent="fileRClick($event, fileInfo)"
          @check-change="toggleSelectFile(fileInfo)"
        />
      </grid-container>
    </div>
    <div
      v-show="previewReadme && readme && readme.length"
      class="readme-view"
      :style="readmeViewStyle"
    >
      <div
        ref="spacerRef"
        class="spacer-line d-flex align-center justify-center"
        @touchstart.prevent="spacerTouchStart"
        @mousedown="spacerTouchStart"
      >
        <div style="line-height: 5px; user-select: none;">
          .<br>.<br>.<br>
        </div>
        
      </div>
      <markdown-view
        style="width: 100%"
        class="readme-content"
        :content="readme"
      />
    </div>
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
import SelectArea from '../SelectArea.vue'


const props = defineProps(propsOptions)
const handler = inject<Ref<FileSystemHandler>>('fileSystemHandler', null as any) as Ref<FileSystemHandler>

// 当前文件列表的README.md内容
const readme = ref('')
const readmeViewMaxHeight = ref('0')
const readmeViewOffsetWidth = ref('0px')

let lastClickFile: FileInfo | null | boolean = null
const selectedFile = reactive({}) as {[key:string]: FileInfo}
const renameNewName = ref('')
const renameIndex = ref(-1)
let renamePromiseResolve: ((value: string | PromiseLike<string>) => void) | null= null
let renamePromiseReject: ((value: string | PromiseLike<string>) => void) | null = null

// 执行重命名取消动作的函数，在grid和list模式下是不同的，动态赋值
let cancelRenameActionFun: Function
const tableWidth = ref('100%')
const rootRef = ref() as Ref<HTMLElement>
const tableRef = ref() as Ref<ComponentPublicInstance>
const gridRef = ref() as Ref<ComponentPublicInstance>
const spacerRef = ref() as Ref<HTMLElement>
const gridItemRef = ref()

// 是否处于文件框选状态
let inSelect = false

const emits = defineEmits<{
  (event: 'clickItem', ctx: FileListContext ,item: FileInfo): void,
  (event: 'back'): void,
  (event: 'refresh'): void,
  (event: 'update:file-list', fileList: FileInfo[]): void
}>()

// README.md预览视图的style，设定最大高度和动态宽度
const readmeViewStyle = computed(() => {
  return {
    'maxHeight': readmeViewMaxHeight.value,
    '--readme-width-offset': readmeViewOffsetWidth.value
  }
})

// 文件是否部分选中
const partInSelect = computed(() => {
  return fileListContext.selectFileList.length > 0 && fileListContext.selectFileList.length != props.fileList.length
})

// 文件是否全选
const allInSelect = computed(() => {
  return props.fileList.length != 0 && props.fileList.length == fileListContext.selectFileList.length
})

// 滚动检测锚点DOM
const scrollAnchor = computed(() => {
  if (props.type == 'list') {
    return tableRef.value?.$el.querySelector('.v-table__wrapper')
  } else {
    return gridRef.value?.$el
  }
})

// 更新readme.md预览框的最大高度，保持和文件列表一致
const updateReadmeMaxHeight = () => {
  readmeViewMaxHeight.value = props.height ? (props.height + 'px') : 'auto'
}

// 获取可选择的DOM集合
const fileElementsGetter = () => {
  if (props.type == 'list') {
    return tableRef.value?.$el.querySelectorAll('tbody>tr[file-item=""]') as HTMLElement[]
  } else {
    return (gridRef as Ref<ComponentPublicInstance>).value?.$el.querySelectorAll('.file-grid-item')
  }
}
const selectMove = (e:SelectResult) => {
  if (!e.event.ctrlKey) {
    resetSelect()
  }
  
  e.index.forEach(index => {
    const fileInfo = props.fileList[index]
    const key = fileInfo.name + fileInfo.md5
    selectedFile[key] = fileInfo
  })
}
const selectStart = () => {
  inSelect = true
}

const rename = (name: string, md5: string) => {
  resetSelect()
  renameIndex.value = props.fileList.findIndex(e => e.name == name)
  renameNewName.value = name
  if (props.type == 'grid') {
    const gridItemInst = gridItemRef.value.find((e: any) => e.getFileInfo().name == name)
    cancelRenameActionFun = gridItemInst.cancelRename
    // 针对grid模式的重命名
    return gridItemInst.rename().then((newName: string) => {
      const sameNameIndex = props.fileList.findIndex((e, idx) => e.name == newName && idx != renameIndex.value)
      if (sameNameIndex != -1) {
        renameIndex.value = -1
        SfcUtils.snackbar('存在同名文件')
        return Promise.reject('存在同名文件')
      } else {
        return handler.value.rename(props.path, props.fileList[renameIndex.value].name, newName).then(() => {
          return Promise.resolve(newName)
        })
      }
    }).finally(() => {
      renameIndex.value = -1
    })
  } else {
    cancelRenameActionFun = cancelRename
    // 针对list模式的重命名
    return new LoadingControlPromise<string>((resolve, reject) => {
      renamePromiseResolve = resolve
      renamePromiseReject = reject
      nextTick().then(() => {
        (rootRef.value.querySelector('.rename-input') as HTMLInputElement).select()
      })
    }, false)
  }
}

const fileListContext: FileListContext = FileListContextBuilder.getFileListContext({
  props,
  emits,
  rename,
  handler,
  protocol: inject('protocol', ''),
  protocolParams: inject('protocolParams', () => {
    return { id: props.uid }
  })
})
const toggleSelectAll = () => {
  lastClickFile = true
  if (partInSelect.value || !allInSelect.value) {
    setSelectFile(...props.fileList)
  } else {
    setSelectFile()
  }
}
/**
 * 文件多选框勾选点击事件
 * @param e 鼠标事件
 * @param fileInfo 勾选的选择框所属的文件信息
 */
const checkClick = (e: MouseEvent, fileInfo: FileInfo) => {
  lastClickFile = fileInfo
  toggleSelectFile(fileInfo)
}

/**
 * list模式的取消重命名
 */
const cancelRename = () => {
  renamePromiseReject && renamePromiseReject('重命名取消')
  renameIndex.value = -1
}

/**
 * list模式的执行重命名
 */
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
  if (!lastClickFile && !e.ctrlKey && !inSelect) {
    resetSelect()
  }
  lastClickFile = null
  inSelect = false
  if (renameIndex.value != -1) {
    renameIndex.value = -1
    SfcUtils.snackbar('重命名已取消', 1000, {outClose: true})
    cancelRenameActionFun && cancelRenameActionFun()
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

/**
 * README.md视图切割线点击开始
 */
const spacerTouchStart = (e: TouchEvent | MouseEvent) => {
  document.body.classList.add('no-select')
  const originOffset = parseInt(readmeViewOffsetWidth.value || '0px')
  let originX = 0
  if (e instanceof TouchEvent) {
    originX = e.touches[0].screenX
  } else {
    originX = e.screenX
  }
  const moveAction = (me: TouchEvent | MouseEvent) => {
    let offsetX = 0
    if (me instanceof TouchEvent) {
      offsetX = originX - me.touches[0].screenX
    } else {
      offsetX = originX - me.screenX
    }
    offsetX += originOffset
    readmeViewOffsetWidth.value = offsetX + 'px'
  }
  const releaseAction = () => {
    document.body.classList.remove('no-select')
    window.removeEventListener('mouseup', releaseAction)
    window.removeEventListener('touchend', releaseAction)
    window.removeEventListener('mousemove', moveAction)
    window.removeEventListener('touchmove', moveAction)
  }
  window.addEventListener('mouseup', releaseAction)
  window.addEventListener('touchend', releaseAction)
  window.addEventListener('mousemove', moveAction)
  window.addEventListener('touchmove', moveAction)
}

/**
 * 重置已选择的文件，清空
 */
const resetSelect = () => {
  Object.keys(selectedFile).forEach(key => {
    delete selectedFile[key]
  })
  cancelRenameActionFun && cancelRenameActionFun()
}

/**
 * 窗口大小重置时的操作
 */
const resizeHandler = async() => {
  const el = rootRef.value as HTMLElement
  tableWidth.value = (el.clientWidth - 128)+ 'px'

  await SfcUtils.sleep(100)
  updateReadmeMaxHeight()
}

const containerHeight = computed(() => {
  return props.height ? ((props.height - 16) + 'px') : 'auto'
})

const formatSize = (size: number) => {
  return StringFormatter.toSize(size)
}
watch(() => props.readOnly, () => {
  fileListContext.readonly = props.readOnly
})

/**
 * 加载README.md预览
 */
const loadReadme = async() => {
  if (!props.previewReadme) {
    readme.value = ''
    return
  }
  fileListContext.fileList = props.fileList
  let readmeFile: FileInfo | undefined
  let url: string | undefined
  const haveReadme = props.fileList
                    && (readmeFile = props.fileList.find(e => e.name == 'README.md' && !e.dir && e.size > 0 && e.size <= 1024 * 1024 * 5))
                    && (url = fileListContext.getFileUrl(readmeFile as FileInfo))
                    
  readme.value = ''
  if (haveReadme) {
    loadMDToHtml(url as string)
      .then(html => readme.value = html)
      .then(() => SfcUtils.sleep(100))
      .then(updateReadmeMaxHeight)
  }
}

watch(() => props.fileList, () => {
  loadReadme()
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

onMounted(async() => {
  fileListContext.uid = props.uid
  window.addEventListener('resize', resizeHandler)
  resizeHandler()

})
onUnmounted(() => {
  window.removeEventListener('resize', resizeHandler)
})
defineExpose({
  context: fileListContext
})
</script>

<script lang="ts">
import { FileSystemHandler } from '@/core/serivce/FileSystemHandler'
import { FileListContext,FileInfo } from '@/core/model'
import { defineExpose ,defineComponent, Ref, reactive, inject, watch, ref, onMounted, onUnmounted, computed, nextTick, ComponentPublicInstance } from 'vue'
import { SelectResult } from '@/core/model/component/SelectArea'
import { loadMDToHtml } from './MarkdownLoader'

export default defineComponent({
  name: 'FileList'
})
</script>


<style lang="scss" scoped>
@import './style.scss';
.grid-container {
  height: v-bind(containerHeight);
  padding: 6px 8px;
  overflow: auto;
}
</style>