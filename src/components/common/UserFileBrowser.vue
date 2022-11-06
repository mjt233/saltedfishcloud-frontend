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
      <file-browser
        ref="browser"
        :path="path"
        :file-system-handler="handler"
        :read-only="readOnly"
        :uid="uid"
        :tool-buttons="context.menu.value.fileBrowserBtn"
        auto-compute-height
        :show-mount-icon="true"
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
      </file-browser>
    </div>
    <div v-else-if="!showSearch" class="d-flex justify-center">
      <v-card
        color="background"
        title="访问受限"
        max-width="640px"
        width="100%"
      >
        <v-card-content>
          <p style="margin-bottom: 16px">
            私人网盘功能需要登录账号才能使用捏~φ(゜▽゜*)♪
          </p>
          <v-btn color="primary" @click="login">
            立即登录
          </v-btn>
        </v-card-content>
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
      <file-search-list
        ref="searchListRef"
        :uid="uid"
        :keywork="searchName"
        @click-parent="clickSearchParent"
        @click-item="clickSearchItem"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import FileBrowser from '@/components/common/FileBrowser.vue'
import { FileSystemHandlerFactory } from '@/core/serivce/FileSystemHandler'
import {FileSearchList,TextInput,LoadingMask } from '@/components'

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
  }
})
const showSearch = ref(false)
const inDragging = ref(false)
const session = context.session
const browser = ref()
const emits = defineEmits(['update:path'])
const searchName = ref('')
const loadingManager = new LoadingManager()
const handler = computed(() => {
  return FileSystemHandlerFactory.getFileSystemHandler(ref(props.uid))
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

/**
 * 搜索列表点击文件的所在目录事件回调
 */
const clickSearchParent = async(item: SearchFileInfo) => {
  loadingManager.beginLoading()
  try {
    const parsePath = (await SfcUtils.request(API.resource.parseNodeId(props.uid, item.node))).data.data
    emits('update:path', parsePath)
    await nextTick()
    showSearch.value = false
  } catch(err) {
    SfcUtils.snackbar(err)
  } finally {
    loadingManager.closeLoading()
  }
}
const dragLeave = (e: DragEvent) => {
  inDragging.value = false
} 
const dragOver = (e: DragEvent) => {
  if (!readOnly.value && props.useDropUpload) {
    inDragging.value = true
  }
}
const dropFinish = (e: DragEvent) => {
  inDragging.value = false
  if (!props.useDropUpload || readOnly.value || !e.dataTransfer?.files.length) {
    return
  }
  const fileCount = e.dataTransfer.files.length
  for (let i = 0; i < fileCount; i++) {
    const file = e.dataTransfer.files[i]
    const executor = DiskFileUploadService.uploadToDisk(props.uid, props.path, file)
    fileUploadTaskManager.addExecutor(executor)
  }
  SfcUtils.snackbar(`已添加${fileCount}个文件到上传队列`)
}
const clickSearchItem = async(item: SearchFileInfo) => {
  try {
    if (item.dir) {
      const path = (await SfcUtils.request(API.resource.parseNodeId(props.uid, item.md5))).data.data
      emits('update:path', path)
      showSearch.value = false
    } else {
      SfcUtils.openFile(searchListRef.value.getListContext(), item)
    }
  } catch (err) {
    console.error(err)
    SfcUtils.snackbar(err)
  }
  
}
</script>

<script lang="ts">
import { context } from '@/core/context'
import { computed, defineComponent, nextTick, onMounted, Ref, ref, watch } from 'vue'
import SfcUtils from '@/utils/SfcUtils'
import API from '@/api'
import { SearchFileInfo } from '@/core/model'
import { LoadingManager } from '@/utils/LoadingManager'
import { FileSearchListModel } from '@/core/model/component/FileListModel'
import { DiskFileUploadService, fileUploadTaskManager } from '@/core/serivce/FileUpload'
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