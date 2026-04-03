<template>
  <VSheet ref="thisRef" :class="isMobile ? '' : 'pl-3 pr-3'">
    <ResizeContainer :hide-right="!isSideActive || isMobile" @right-active-change="sideActiveChange">
      <div ref="fileExplorerContentRef">
        <!-- 路径栏 -->
        <FileExplorerPath
          :path="path"
          :root-name="rootName"
          :show-count="isMobile ? 2 : 3"
          @path-click="changePath($event)"
        />

        <!-- 工具栏 -->
        <div v-if="!hideToolBar && !hideFileViewToggle" class="d-flex justify-space-between align-center hide-in-mobile" style="height: 60px;">
          <FileExplorerToolBar
            v-if="!hideToolBar"
            :ctx="ctx"
            :file-item-menu="listMenu"
            :to-new-buttons="toolButtons"
            :read-only="readOnly"
            @clear-selection="fileViewRef.selectFile([])"
          />
          <VSpacer />
          <VBtnToggle
            v-if="!hideFileViewToggle"
            :model-value="actualFileViewType"
            density="comfortable"
            border
            class="ml-2"
          >
            <VTooltip text="网格视图" location="top">
              <template #activator="{ props: tooltipProps }">
                <VBtn
                  value="grid"
                  icon="mdi-grid"
                  v-bind="tooltipProps"
                  @click="emits('update:fileViewType', 'grid')"
                />
              </template>
            </VTooltip>
            <VTooltip text="平铺视图" location="top">
              <template #activator="{ props: tooltipProps }">
                <VBtn
                  value="tile"
                  icon="mdi-view-module"
                  v-bind="tooltipProps"
                  @click="emits('update:fileViewType', 'tile')"
                />
              </template>
            </VTooltip>
            <VTooltip text="表格视图" location="top">
              <template #activator="{ props: tooltipProps }">
                <VBtn
                  value="table"
                  icon="mdi-table"
                  v-bind="tooltipProps"
                  @click="emits('update:fileViewType', 'table')"
                />
              </template>
            </VTooltip>
            <VTooltip text="列表视图" location="top">
              <template #activator="{ props: tooltipProps }">
                <VBtn
                  value="list"
                  icon="mdi-format-list-bulleted-square"
                  v-bind="tooltipProps"
                  @click="emits('update:fileViewType', 'list')"
                />
              </template>
            </VTooltip>
          </VBtnToggle>
        </div>

        <!-- 右键菜单 -->
        <FileMenu
          v-if="$el && finalFileItemMenus.length"
          :list-context="ctx"
          :container="$el"
          :menu="finalFileItemMenus"
          :loading-manager="lm"
        />

        <!-- 移动端右下角操作按钮，默认为新增菜单，可通过插槽添加自定义操作按钮 -->
        <MobileFloatingAddButton
          v-if="isMobile"
          :menu-items="toolButtons"
          :ctx="ctx"
          :read-only="readOnly"
        >
          <template v-if="previewReadme" #prepend="{ props: btnProps }">
            <VSlideYReverseTransition>
              <VBtn
                v-show="readmeFileInfo"
                v-bind="btnProps"
                icon="mdi-text-box"
                size="large"
                :color="readOnly ? 'primary' : undefined"
                @click="showMobileReadme"
              />
            </VSlideYReverseTransition>
          </template>
        </MobileFloatingAddButton>
    

        <!-- 文件列表视图本体 -->
        <component
          :is="fileViewMap[actualFileViewType]"
          ref="fileViewRef"
          :path="path"
          :file-list="ctxDataSource.fileList"
          :is-loading="isLoading"
          :multiple-select="useSelect"
          :height="listHeight"
          :style="{ 'min-height': listHeight }"
          :show-mount-icon="showMountIcon"
          :custom-thumbnail-url="customThumbnailUrl"
          @file-click="fileClick"
          @file-r-click="fileRClick"
          @file-select="updateSelectedFileList()"
        />
      </div>

      <template #resizeable>
        <div>
          <div class="d-flex justify-space-between align-center pl-1 pt-1 pb-1">
            <span style="font-size: 18px;">{{ sideSupport.sideTitle || '' }}</span> 
            <VBtn
              icon="mdi-close"
              variant="text"
              title="关闭侧栏"
              @click="closeSide"
            />
          </div>
          <div ref="sideBodyRef" style="overflow: auto;" :style="{ height: sideHeight + 'px' }">
            <component :is="sideSupport.sideComponent" v-bind="sideSupport.sideProps" />
          </div>
        </div>
      </template>
      <slot name="append" :ctx="ctx" />
    </ResizeContainer>
  </VSheet>
</template>

<script setup lang="ts">
const fileExplorerContentRef = ref<HTMLDivElement>()
const emits = defineEmits<{
  (e: 'update:path', path: string): void
  (e: 'update:fileViewType', fileViewType: FileViewType): void

  /**
   * 文件被点击（移动端单击或PC端双击）
   */
  (e: 'fileClick', file: FileInfo): void
}>()
const isMobile = useCheckIsMobile()
const props = withDefaults(defineProps<FileExplorerProps>(), {
  path: '/',
  fileViewType: 'table',
  useSelect: true,
  autoOpenFile: true
})
const actualFileViewType = computed(() => {
  return isMobile.value ? 'list' : props.fileViewType
})
watch(isMobile, () => {
  sideSupport.isEnabled = !isMobile.value
})
// 文件视图类型与组件的映射关系
const fileViewMap = {
  table: FileExplorerTableView,
  list: FileExplorerListView,
  grid: FileExplorerGridView,
  tile: FileExplorerTileView
}
watch(actualFileViewType, () => {
  // 切换文件视图时，已选文件可能会发生变化
  updateSelectedFileList()
})
useBackspaceGoBack({
  focusRoot: () => fileExplorerContentRef.value as HTMLElement,
  onGoBack() {
    const paths = props.path.split('/').filter(e => e)
    if (paths.length == 0) {
      return
    }
    paths.pop()
    changePath('/' + paths.join('/'))
  }
})
// 侧边栏的div引用
const sideBodyRef = ref<HTMLDivElement>()

// 当前的已选文件列表
const selectedFileList: Ref<FileInfo[]> = ref([])

// 文件列表上下文数据源
const ctxDataSource = reactive({
  uid: props.uid,
  path: props.path,
  protocol: props.protocol || inject('protocol', 'main'),
  fileList: [] as FileInfo[],
  selectFileList: selectedFileList.value,
  readonly: props.readOnly,
  enableFeature: 'all',
  protocolParams: inject('protocolParams', () => {
    return {  }
  }),
  fileSystemHandler: () => props.fileSystemHandler
}) as FileListContextDataSource

// 文件列表上下文对象
const ctx = reactive(createListContext(ctxDataSource))
const sideSupport = ctx.sideSupport
sideSupport.isEnabled = true

// 外部调用了context的文件列表刷新后，重新同步上下文数据源
ctx.addEventListener('refresh', (fileList: FileInfo[]) => {
  ctxDataSource.fileList = fileList
  afterFileListLoaded(props.path)
})

function customThumbnailUrl(file: FileInfo) {
  return ctxDataSource.fileSystemHandler().getCustomThumbnailUrl(props.path, file) || ''
}

// 本组件本身的引用
const thisRef = ref()
// 文件列表组件实例引用
const fileViewRef = ref() as Ref<ComponentPublicInstance & FileExplorerViewExpose>

// 加载状态管理器
const lm = new LoadingManager()
const isLoading = lm.getLoadingRef()

const actions = MethodInterceptor.createAsyncActionProxy({
  loadList: async(path: string) => {
    ctxDataSource.fileList = await ctxDataSource.fileSystemHandler().loadList(path)
    afterFileListLoaded(path)
    return ctxDataSource.fileList 
  }
}, true, lm)

async function afterFileListLoaded(path: string) {
  if (props.filter) {
    ctxDataSource.fileList = ctxDataSource.fileList.filter(props.filter)
  }
  ctxDataSource.fileList.forEach(file => {
    if (!file.path) {
      file.path = path
    }
  })
  closeSide()
  await SfcUtils.sleep(5)
  ctx.syncDataSource()
  // 尝试加载README文件
  await tryLoadReadMe()
}

/**
 * 文件列表的文件被双击回调
 */
function fileClick(file: FileInfo) {
  emits('fileClick', file)
  if (file.dir) {
    // 如果是目录，则切换路径
    const nextPath = StringUtils.appendPath(props.path, file.name)
    changePath(nextPath)
  } else {
    if (props.autoOpenFile) {
      // 打开文件
      SfcUtils.openFile(ctx, file)
    }
  }
}

/**
 * 文件列表的文件被右击回调
 */
function fileRClick(file: FileInfo) {
  // 右键会触发列表的已选文件更新，需要更新已选文件列表
  updateSelectedFileList()

  // 右键打开的文件菜单由FileMenu组件内部处理了
}

const readmeFileInfo = computed(() => {
  return ctx.fileList.find(file => file.name.toLowerCase() == 'readme.md')
})

/**
 * 尝试加载README文件
 */
async function tryLoadReadMe() {
  if (!sideSupport.isEnabled || !props.previewReadme) {
    return
  }
  if (!readmeFileInfo.value) {
    return
  }
  const md = (await SfcUtils.request({ url: ctx.getFileUrl(readmeFileInfo.value) })).request.responseText as string
  sideSupport.setSide(MarkdownView, { content: md, resourceParams: ctx.getProtocolParams() }, '页面描述')
}


/**
 * 移动端视图下显示README文件
 */
async function showMobileReadme() {
  if (!readmeFileInfo.value) {
    return
  }
  const md = (await SfcUtils.request({ url: ctx.getFileUrl(readmeFileInfo.value) })).request.responseText as string
  SfcUtils.openComponentDialog(MarkdownView, {
    props: { content: md, resourceParams: ctx.getProtocolParams() },
    title: '页面描述',
    showConfirm: false
  })
}

async function sideActiveChange() {
  await SfcUtils.sleep(200)
  updateSideHeight()
}

/**
 * 更新已选文件列表
 */
function updateSelectedFileList() {
  selectedFileList.value = fileViewRef.value.getSelectedFileList()
  ctxDataSource.selectFileList = selectedFileList.value
  ctx.syncDataSource()
}

/**
 * 切换当前文件浏览器的路径
 * @param newPath 新路径
 */
async function changePath(newPath: string) {
  fileViewRef.value.selectFile([])
  await actions.loadList(newPath)
  emits('update:path', newPath)
  ctxDataSource.path = newPath
  ctx.syncDataSource()
}

function closeSide() {
  sideSupport.setSide()
}

/**
 * 自动计算文件列表高度，使其填充页面底部而刚好不溢出
 */
const { targetHeight: listHeight } = useAutoComputeHeight({
  autoComputeHeight: props.autoComputeHeight,
  computeTarget: () => fileViewRef.value.$el,
  observeTarget: () => thisRef.value.$el,
  offset: props.autoComputeHeightOffset || 0
})
const { targetHeight: sideHeight, updateHeight: updateSideHeight } = useAutoComputeHeight({
  autoComputeHeight: props.autoComputeHeight,
  computeTarget: () => sideBodyRef.value,
  observeTarget: () => thisRef.value.$el,
  offset: props.autoComputeHeightOffset || 0
})
const isSideActive = computed(() => {
  return sideSupport.isEnabled && !!sideSupport.sideComponent
})
watch(() => isSideActive.value, (isActive) => {
  if (isActive) {
    updateSideHeight()
  }
})

/**
 * 文件列表右键菜单
 */
const menu = getContext().menu
const listMenu = useListMenu({
  listMenu: menu.value.fileListMenu,
  appendMenu: props.appendMenu,
  enableMenu: props.enableMenu,
  disabledMenu: props.disabledMenu,
  listContext: ctx
})

const finalFileItemMenus = computed(() => {
  if (props.hideFileViewToggle) {
    return listMenu.value
  }
  // FileExplorer的内置菜单组，给文件菜单添加文件视图切换功能
  // 菜单的层级均为 菜单组 => 菜单项 => 菜单组 => 菜单项...的方式无限嵌套
  const buildInMenus = [
    {
      // 第一层对象，表示菜单组
      id: 'file-view-type',
      name: '文件视图操作（内置）',
      renderOn(ctx) {
        return !ctx?.selectFileList || ctx.selectFileList.length == 0
      },
      items: [
        // 第二层对象，表示该菜单组下的具体菜单项
        {
          id: 'file-view-type-switch',
          title: '查看方式',
          subItems(ctx) {
            const viewTypes = [,
              { id: 'grid', name: '网格' },
              { id: 'tile', name: '平铺' },
              { id: 'table', name: '表格' },
              { id: 'list', name: '列表' }
            ] as { id: FileViewType, name: string }[]
            
            // 第三层对象，表示菜单组
            return [
              {
                id: 'file-view-type-switch-group',
                name: '',
                // 第四层对象，表示菜单项
                items: viewTypes.map(viewType => {
                  return {
                    id: `file-view-type-switch-${viewType.id}`,
                    title: viewType.name,
                    icon: viewType.id == props.fileViewType ? 'mdi-checkbox-marked-circle' : 'mdi-checkbox-blank-circle-outline',
                    action(ctx) {
                      emits('update:fileViewType', viewType.id)
                    }
                  }
                })
              }
            ]
          },
        }
      ]
    }
  ] as MenuGroup<FileListContext>[]
  return buildInMenus.concat(listMenu.value)
})

onMounted(async() => {
  ctxDataSource.fileList = await actions.loadList(props.path)
})

defineExpose({
  changePath,
  selectFile(fileNames: string[]) {
    fileViewRef.value.selectFile(fileNames)
  },
  scrollTo(fileName: string) {
    fileViewRef.value.scrollTo(fileName)
  },
  getListContext() {
    return ctx
  }
})
</script>

<script lang="ts">
import { getContext, MenuGroup, MenuSubItem } from 'sfc-common/core'
import { FileInfo, FileListContext } from 'sfc-common/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, onUnmounted, reactive, inject, computed, ComponentInstance, ComponentPublicInstance, provide, watch, mergeProps, nextTick } from 'vue'
import { LoadingManager, MethodInterceptor, StringUtils } from 'sfc-common/utils'
import { createListContext, FileListContextDataSource, useSideSupport } from './createListContext'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import FileMenu from '../FileMenu.vue'
import { FileExplorerViewExpose } from './fileView/baseDefine'
import { FileExplorerProps, FileViewType, useAutoComputeHeight, useBackspaceGoBack, useListMenu } from './FileExplorerCore'
import FileExplorerPath from './FileExplorerPath.vue'
import FileExplorerToolBar from './FileExplorerToolBar.vue'
import FileExplorerTableView from './fileView/FileExplorerTableView.vue'
import FileExplorerListView from './fileView/FileExplorerListView.vue'
import FileExplorerGridView from './fileView/FileExplorerGridView.vue'
import FileExplorerTileView from './fileView/FileExplorerTileView.vue'
import ResizeContainer from 'sfc-common/components/layout/ResizeContainer.vue'
import MarkdownView from '../Markdown/MarkdownView.vue'
import { useCheckIsMobile } from 'sfc-common/composables/useCheckIsMobile'
import MobileFloatingAddButton from './MobileFloatingAddButton.vue'

export default defineComponent({
  name: 'FileExplorer'
})
</script>