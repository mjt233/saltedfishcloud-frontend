<template>
  <div>
    <!-- 当访问公共网盘 或 已登录用户访问非公共网盘 -->
    <div v-if="!showSearch && (uid == 0 || (uid != 0 && session.user.id != 0))">
      <file-browser
        ref="browser"
        :path="path"
        :file-system-handler="handler"
        :read-only="readOnly"
        :uid="uid"
        :top-buttons="context.menu.value.fileBrowserBtn"
        auto-compute-height
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
import TextInput from '@/components/common/TextInput.vue'
import FileSearchList from './FileSearchList/FileSearchList.vue'
import LoadingMask from './LoadingMask.vue'
const searchListRef = ref() as Ref<FileSearchListModel>
const props = defineProps({
  uid: {
    type: [Number, String],
    default: 0
  },
  path: {
    type: String,
    default: '/'
  }
})
const showSearch = ref(false)
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

const clickSearchItem = (item: SearchFileInfo) => {
  SfcUtils.openFile(searchListRef.value.getListContext(), item)
}
</script>

<script lang="ts">
import { context } from '@/core/context'
import { computed, defineComponent, nextTick, onMounted, Ref, ref, watch } from 'vue'
import SfcUtils from '@/utils/SfcUtils'
import API from '@/api'
import { SearchFileInfo } from '@/core/model'
import { LoadingManager } from '@/utils/LoadingManager'
import { StringUtils } from '@/utils/StringUtils'
import { FileSearchListModel } from '@/core/model/component/FileListModel'
export default defineComponent({
  name: 'UserFileBrowser'
})
</script>