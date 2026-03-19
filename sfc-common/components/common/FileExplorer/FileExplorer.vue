<template>
  <VSheet ref="thisRef" class="pl-3">
    <!-- 路径栏 -->
    <FileExplorerPath
      :path="path"
      :root-name="rootName"
      @path-click="changePath($event)"
    />

    <!-- 工具栏 -->
    <VFadeTransition
      hide-on-leave
      style="height: 36px;"
      class="mb-3 mt-3"
    >
      <!-- 已选文件时的工具栏 -->
      <VChip v-if="ctx.selectFileList.length > 0" style="height: 36px;">
        <VTooltip text="取消选择" location="bottom" open-delay="500">
          <template #activator="{ props: p }">
            <VBtn
              size="x-small"
              style="font-size: 12px;"
              variant="text"
              icon="mdi-close"
              v-bind="p"
              @click="listRef.selectFile([])"
            />
          </template>
        </VTooltip>
        <span class="ml-2 mr-2">已选{{ ctx.selectFileList.length }}个文件</span>
        <span>
          <template v-for="menuGroup in listMenu" :key="menuGroup.id">
            <template v-for="item in menuGroup.items" :key="item.id">
              <VTooltip
                v-if="!item.subItems?.length"
                :text="item.title"
                location="bottom"
              >
                <template #activator="{ props: p }">
                  <VBtn
                    variant="text"
                    :icon="item.icon"
                    size="small"
                    @click="item.action && item.action(ctx)"
                  >
                    <CommonIcon :icon="item.icon" v-bind="p" />
                  </VBtn>
                </template>
              </VTooltip>
            </template>
          
            <VDivider vertical />
          </template>
        </span>
      </VChip>
      <template v-else-if="!readOnly">
        <!-- 未选文件时的工具栏 -->
        <div>
          <VMenu>
            <template #activator="{ props: p }">
              <VBtn text="新建" v-bind="p">
                <template #prepend>
                  <VIcon>mdi-plus</VIcon>
                </template>
              </VBtn>
            </template>

            <VList color="primary" density="comfortable">
              <template v-for="menuGroup in toolButtons" :key="menuGroup.id">
                <VListSubheader :title="menuGroup.name" />
                <VListItem
                  v-for="item in menuGroup.items"
                  :key="item.id"
                  :title="item.title"
                  @click="item.action && item.action(ctx)"
                >
                  <template #prepend>
                    <CommonIcon :icon="item.icon" class="mr-2 mb-1" />
                  </template>
                </VListItem>
              </template>
            </VList>
          </VMenu>
        </div>
      </template>
    </VFadeTransition>

    <!-- 右键菜单 -->
    <FileMenu
      v-if="$el && listMenu.length"
      :list-context="ctx"
      :container="$el"
      :menu="listMenu"
      :loading-manager="lm"
    />

    <!-- 文件列表本体 -->
    <FileExplorerTable
      ref="listRef"
      :path="path"
      :file-list="ctxDataSource.fileList"
      :is-loading="isLoading"
      use-select
      :height="listHeight"
      :style="{ 'min-height': listHeight }"
      @file-click="fileClick"
      @file-r-click="fileRClick"
      @file-select="updateSelectedFileList()"
    />
  </VSheet>
</template>

<script setup lang="ts">
const emits = defineEmits<{
  (e: 'update:path', path: string): void
}>()
const props = withDefaults(defineProps<FileExplorerProps>(), {
  path: '/'
})

// 当前的已选文件列表
const selectedFileList: Ref<FileInfo[]> = ref([])
const ctxDataSource = reactive({
  uid: props.uid,
  path: props.path,
  protocol: inject('protocol', ''),
  fileList: [] as FileInfo[],
  selectFileList: selectedFileList.value,
  readonly: props.readOnly,
  enableFeature: 'all',
  protocolParams: inject('protocolParams', () => {
    return { id: props.uid }
  }),
  fileSystemHandler: () => props.fileSystemHandler
}) as FileListContextDataSource

const ctx = reactive(createListContext(ctxDataSource))
ctx.addEventListener('refresh', (fileList: FileInfo[]) => {
  ctxDataSource.fileList = fileList
  ctx.syncDataSource()
})
const thisRef = ref()
const listRef = ref() as Ref<ComponentPublicInstance & FileExplorerListExpose>

const lm = new LoadingManager()
const isLoading = lm.getLoadingRef()

const actions = MethodInterceptor.createAsyncActionProxy({
  loadList: async(path: string) => {
    const l = ctxDataSource.fileList = await ctxDataSource.fileSystemHandler().loadList(path)
    ctx.syncDataSource()
    return l
  }
}, true, lm)

function fileClick(file: FileInfo) {
  if (file.dir) {
    const nextPath = StringUtils.appendPath(props.path, file.name)
    changePath(nextPath)
  } else {
    SfcUtils.openFile(ctx, file)
  }
}

function fileRClick(file: FileInfo) {
  updateSelectedFileList()
}


/**
 * 更新已选文件列表
 */
function updateSelectedFileList() {
  selectedFileList.value = listRef.value.getSelectedFileList()
  ctxDataSource.selectFileList = selectedFileList.value
  ctx.syncDataSource()
}

/**
 * 切换路径
 * @param newPath 新路径
 */
async function changePath(newPath: string) {
  listRef.value.selectFile([])
  await actions.loadList(newPath)
  emits('update:path', newPath)
  ctxDataSource.path = newPath
  ctx.syncDataSource()
}

// 自动计算文件列表高度，使其填充页面底部而刚好不溢出
const listHeight = useAutoComputeHeight({
  autoComputeHeight: props.autoComputeHeight,
  computeTarget: () => listRef.value.$el,
  observeTarget: () => thisRef.value.$el,
  offset: props.autoComputeHeightOffset || 0
})

// 文件列表右键菜单
const menu = getContext().menu
const listMenu = useListMenu({
  listMenu: menu.value.fileListMenu,
  appendMenu: props.appendMenu,
  enableMenu: props.enableMenu,
  disabledMenu: props.disabledMenu,
  listContext: ctx
})

onMounted(async() => {
  ctxDataSource.fileList = await actions.loadList(props.path)
})
</script>

<script lang="ts">
import { getContext, MenuGroup } from 'sfc-common/core'
import { FileSystemHandler } from 'sfc-common/core/serivce/FileSystemHandler'
import { FileInfo, FileListContext } from 'sfc-common/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, onUnmounted, reactive, inject, computed, ComponentInstance, ComponentPublicInstance, provide } from 'vue'
import { LoadingManager, MethodInterceptor, StringUtils } from 'sfc-common/utils'
import FileExplorerTable from './variant/FileExplorerTable.vue'
import { createListContext, FileListContextDataSource } from './createListContext'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import FileMenu from '../FileMenu.vue'
import { FileExplorerListExpose } from './variant/baseDefine'
import { FileExplorerProps, useAutoComputeHeight, useListMenu } from './FileExplorerCore'
import FileExplorerPath from './FileExplorerPath.vue'
import CommonIcon from '../CommonIcon.vue'

export default defineComponent({
  name: 'FileExplorer'
})
</script>