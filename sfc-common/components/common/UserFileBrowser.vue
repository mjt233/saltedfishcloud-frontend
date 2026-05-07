<template>
  <div 
    @dragover.prevent="dragOver"
    @dragleave.self="dragLeave"
    @drop.prevent="dropFinish"
  >
    <div v-show="inDragging" class="drag-tip">
      <common-icon icon="mdi-upload" />
      <span>拖拽上传</span>
    </div>
    <!-- 当访问公共网盘 或 已登录用户访问非公共网盘 -->
    <div v-if="!showSearch && (uid == 0 || (uid != 0 && session.user.id != 0))">
      <file-explorer
        ref="browser"
        v-model:file-view-type="fileViewType"
        :path="path"
        :file-system-handler="handler"
        :read-only="readOnly"
        :uid="uid"
        :tool-buttons="getContext().menu.value.fileBrowserBtn"
        auto-compute-height
        :root-name="uid == 0 ? '公共资源' : '我的网盘'"
        :show-mount-icon="true"
        :preview-readme="previewReadme"
        @update:path="emits('update:path', $event)"
      >
        <template #top-bar>
          <text-input
            v-model="searchName"
            style="min-width: 210px;margin-right: 6px;"
            placeholder="搜索文件"
            hide-details
            @enter="search"
          />
        </template>
      </file-explorer>
    </div>
    <div v-else-if="!showSearch" class="d-flex justify-center mt-6">
      <v-card
        color="background"
        title="访问受限"
        max-width="640px"
        width="100%"
      >
        <v-card-text>
          <p style="margin-bottom: 16px">
            私人网盘功能需要登录账号才能使用捏~φ(゜▽゜*)♪
          </p>
          <v-btn color="primary" @click="login">
            立即登录
          </v-btn>
        </v-card-text>
      </v-card>
    </div>
    <template v-if="showSearch">
      <v-icon
        v-ripple
        style="margin-left: 12px; cursor: pointer;padding: 16px;border-radius: 50%;"
        icon="mdi-close"
        @click="showSearch = false"
      />
      <loading-mask :loading="loadingManager.getLoadingRef().value" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { FileSystemHandlerFactory } from 'sfc-common/core/serivce/FileSystemHandler'
import {FileSearchList,TextInput,LoadingMask } from 'sfc-common/components'
provide('protocol', 'main')
const searchListRef = ref() as Ref<FileSearchListModel>
const props = defineProps({
  uid: {
    type: [Number, String],
    default: 0
  },
  path: {
    type: String,
    default: '/'
  },
  useDropUpload: {
    type: Boolean,
    default: false
  },
  /**
   * 启用README.md预览
   */
  previewReadme: {
    type: Boolean,
    default: false
  }
})
const fileViewType = ref<FileViewType>((localStorage.getItem('userFileViewType') || 'table') as FileViewType)
const showSearch = ref(false)
const inDragging = ref(false)
const session = getContext().session
const browser = ref<InstanceType<typeof FileExplorer>>()
const emits = defineEmits(['update:path'])
const searchName = ref('')
const loadingManager = new LoadingManager()
const handler = computed(() => {
  return FileSystemHandlerFactory.getFileSystemHandler(ref(props.uid))
})

watch(fileViewType, (val) => {
  localStorage.setItem('userFileViewType', val)
})

const login = () => {
  SfcUtils.openLoginDialog()
}

const search = async() => {
  if (searchName.value.length == 0) {
    return
  }
  showSearch.value = true
}

const readOnly = computed(() => {
  // 管理员用户 或 普通用户访问自己的网盘 时关闭只读
  return !(session.value.user.role == 'admin' || (props.uid != 0 && props.uid == session.value.user.id))
})

const dragLeave = (e: DragEvent) => {
  inDragging.value = false
} 
const dragOver = (e: DragEvent) => {
  if (!readOnly.value && props.useDropUpload) {
    inDragging.value = true
  }
}
const dropFinish = async(e: DragEvent) => {
  inDragging.value = false
  if (!props.useDropUpload || readOnly.value || !e.dataTransfer) {
    return
  }
  let fileCount = 0
  const tasks = []
  if (e.dataTransfer.items.length > 0) {
    for(const item of Array.from(e.dataTransfer.items)) {
      if(testIsDir(item)) {
        tasks.push(scanDir(item, i => {
          if (i.isDir) {
            return
          }
          fileCount++
          handler.value.uploadDirect(StringUtils.appendPath(props.path, i.relativePath), i.file as File)
        }))
      } else {
        fileCount++
        handler.value.uploadDirect(props.path, item.getAsFile() as File)
      }
    }
  }
  await Promise.all(tasks)
  if (fileCount == 0) {
    SfcUtils.alert('未检测到文件')
  } else {
    SfcUtils.snackbar(`已添加${fileCount}个文件到上传队列`)
  }
}


// 监听搜索事件
useEventBus({
  [EventNameConstants.SEARCH_IN_DISK](key: string) {
    // todo 文件搜索列表使用新的FileExplorer实现
    const inst = SfcUtils.openComponentDialog(FileSearchList, {
      props: {
        uid: props.uid,
        keywork: key,
        /**
         * 点击父级目录
         */
        async onClickParent(file: SearchFileInfo) {
          inst.close()
          loadingManager.beginLoading()
          try {
            const parsePath = (await SfcUtils.request(API.resource.parseNodeId(props.uid, file.node))).data.data
            await browser.value?.changePath(parsePath)
            browser.value?.selectFile([file.name])
            browser.value?.scrollTo(file.name)
            emits('update:path', parsePath)
            await nextTick()
            showSearch.value = false
          } catch(err) {
            SfcUtils.snackbar(err)
          } finally {
            loadingManager.closeLoading()
          }
        },
        /**
         * 点击搜索结果的文件
         */
        async onClickItem(file: SearchFileInfo) {
          loadingManager.beginLoading()
          try {
            if (file.dir) {
              const path = (await SfcUtils.request(API.resource.parseNodeId(props.uid, file.md5))).data.data
              emits('update:path', path)
              browser.value?.changePath(path)
              inst.close()
              return
            }
            const ctx = browser.value?.getListContext()
            if (!ctx) {
              SfcUtils.snackbar('列表缺少context')
              return
            }
            const parentPath = (await SfcUtils.request(API.resource.parseNodeId(props.uid || 0, file.node))).data.data
            const searchFileInfoRef = inst.getComponentInstRef() as InstanceType<typeof FileSearchList>
            
            const tempCtx: FileListContext = Object.assign({}, ctx, {
              path: parentPath,
              fileList: searchFileInfoRef.getSearchResult().list,
              selectFileList: [file],
              getFileUrl(file: FileInfo) {
                return ctx.getFileUrl(file)
              },
              getProtocolParams() {
                return ctx.getProtocolParams()
              },
              getThumbnailUrl(file: FileInfo) {
                return ctx.getThumbnailUrl(file)
              },
              modelHandler: ctx.modelHandler 
            })
            SfcUtils.openFile(tempCtx, file)
          } finally {
            loadingManager.closeLoading()
          }
        }
      },
      title: `文件搜索 ${key}`,
      dense: true,
      showConfirm: false,
      fullscreen: true,
      extraDialogOptions: {
        cancelText: '关闭'
      }
    })
  }
})

defineExpose({
  changePath(path: string) {
    return browser.value?.changePath(path)
  },
  selectFile(fileName: string[]) {
    return browser.value?.selectFile(fileName)
  },
  scrollTo(fileName: string) {
    return browser.value?.scrollTo(fileName)
  }
})
</script>

<script lang="ts">
import { getContext } from 'sfc-common/core/context'
import { computed, defineComponent, inject, nextTick, onMounted, provide, Ref, ref, watch } from 'vue'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import API from 'sfc-common/api'
import type { FileInfo, FileListContext, SearchFileInfo } from 'sfc-common/model'
import { LoadingManager } from 'sfc-common/utils/LoadingManager'
import { FileSearchListModel } from 'sfc-common/model/component/FileListModel'
import { scanDir, StringUtils, testIsDir } from 'sfc-common/utils'
import FileExplorer from './FileExplorer/FileExplorer.vue'
import { FileViewType } from './FileExplorer/FileExplorerCore'
import { useEventBus } from 'sfc-common/composables'
import { EventNameConstants } from 'sfc-common/core/constans/EventName'
export default defineComponent({
  name: 'UserFileBrowser'
})
</script>


<style scoped>
.drag-tip {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(var(--v-theme-background), .8);
  pointer-events: none;
  z-index: 2;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
}
</style>