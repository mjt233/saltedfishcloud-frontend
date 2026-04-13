<!-- 注：该组件大部分代码由AI生成 -->
<template>
  <div ref="thisRef" style="position: relative;">
    <LoadingMask :loading="isLoading" />
    <VVirtualScroll
      v-if="fileList.length"
      ref="fileItemContainerRef"
      class="file-grid-wrapper"
      :height="height || 400"
      :items="fileRows"
      item-key="rowIndex"
      :item-height="GRID_ROW_HEIGHT"
      @click="containerClickFunction"
      @contextmenu="oncontextmenu"
    >
      <template #default="{ item: row }">
        <div class="file-grid-row">
          <div
            v-for="item in row.files"
            :key="item.name"
            class="file-grid-item-wrapper"
            :style="{ width: `${100 / columnCount}%` }"
            :file-name="item.name"
            @dblclick="itemDoubleClickFunction($event); emits('fileClick', item)"
          >
            <VCard
              class="file-grid-item cursor-default no-select"
              :class="{ 'file-grid-item--selected': selectedSet.has(item.name) }"
            >
              <div class="file-grid-item-icon-wrapper">
                <FileIcon
                  class="file-grid-item-icon"
                  :width="96"
                  :height="96"
                  :is-dir="item.dir"
                  :file-name="item.name"
                  :md5="item.md5"
                  :corner-icon="showMountIcon && item.mountId ? 'mdi-share' : undefined"
                  :custom-thumbnail-url="customThumbnailUrl && customThumbnailUrl(item)"
                />
              </div>

              <div class="file-grid-item-info">
                <div class="file-grid-item-name" :title="item.name">
                  {{ item.name }}
                </div>
                <div class="file-grid-item-meta">
                  <span v-if="!item.dir" class="file-size">{{ StringFormatter.toSize(item.size) }}</span>
                  <span class="file-time">{{ StringFormatter.toDate(item.mtime) }}</span>
                </div>
              </div>
            </VCard>
          </div>
        </div>
      </template>
    </VVirtualScroll>
    <div v-else class="tip text-center" :style="{minHeight: height ? (height + 'px') : undefined}">
      {{ noDataText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResizeObserver } from 'sfc-common/composables/useResizeObserver'

const props = defineProps<FileExplorerViewProps>()
const emits = defineEmits<FileExplorerViewEmits>()

const thisRef = ref<HTMLElement>()
const fileItemContainerRef = ref()

// 视图参数
const GRID_ROW_HEIGHT = 200
const GRID_ITEM_MIN_WIDTH = 180

const columnCount = ref(1)

function calculateColumnCount() {
  const container = fileItemContainerRef.value?.$el as HTMLElement
  if (!container) return 1
  const containerWidth = container.clientWidth - 16 // 减去padding计算
  return Math.max(1, Math.floor(containerWidth / GRID_ITEM_MIN_WIDTH))
}

function updateColumnCount() {
  columnCount.value = calculateColumnCount()
}

useResizeObserver(() => thisRef.value as HTMLElement, updateColumnCount)
watch(fileItemContainerRef, updateColumnCount)
onMounted(() => {
  updateColumnCount()
})

interface FileRow {
  rowIndex: number
  files: FileInfo[]
}

const fileRows = computed<FileRow[]>(() => {
  const rows: FileRow[] = []
  const files = props.fileList
  const cols = columnCount.value
  
  for (let i = 0; i < files.length; i += cols) {
    rows.push({
      rowIndex: Math.floor(i / cols),
      files: files.slice(i, i + cols)
    })
  }
  return rows
})

const { noDataText } = useFileViewText()
const {
  selectedList,
  selectedSet,
  itemDoubleClickFunction,
  containerClickFunction,
  oncontextmenu
} = useFileSelect({
  emits,
  fileList: () => props.fileList,
  itemClickFileNameExtractor(e) {
    const fileItemWrapper = DOMUtils.getElParent(
      e.target as HTMLElement,
      el => el.classList.contains('file-grid-item-wrapper') && !!el.getAttribute('file-name')
    )
    if (fileItemWrapper) {
      return fileItemWrapper.getAttribute('file-name')
    }
    return ''
  },
  multipleSelect: () => props.multipleSelect || false
})

// 文件列表键盘输入快速搜索
useFileListTypeToSearch({
  focusRoot: () => thisRef.value as HTMLElement,
  fileList: () => props.fileList,
  selectedList,
  selectedSet,
  matchCallback(fileName) {
    exposeObj.scrollTo(fileName)
  },
})

// Ctrl+A 全选
useCtrlASelectAll({
  focusRoot: () => thisRef.value as HTMLElement,
  onSelectAll() {
    selectedList.value = props.fileList.map(f => f.name)
  }
})

const exposeObj = getExpose({
  selectedList,
  selectedSet,
  fileList: () => props.fileList,
  fileItemLocator: {
    fileItemContainer: () => (fileItemContainerRef.value.$el as HTMLElement).querySelector('.v-virtual-scroll__container') as HTMLElement,
    perRowFileCount: () => columnCount.value,
    perRowHeight: GRID_ROW_HEIGHT
  }
})
defineExpose(exposeObj)
</script>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { FileExplorerViewEmits, FileExplorerViewProps } from './baseDefine'
import { getExpose, useFileListTypeToSearch, useFileSelect, useFileViewText, useCtrlASelectAll } from './baseImpl'
import FileIcon from '../../FileIcon.vue'
import { DOMUtils, StringFormatter } from 'sfc-common/utils'
import type { FileInfo } from 'sfc-common/model'
import LoadingMask from '../../LoadingMask.vue'

export default defineComponent({
  name: 'FileExplorerGridView'
})
</script>

<style scoped lang="scss">
.file-grid-wrapper {
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px;
}

.file-grid-row {
  display: flex;
  width: 100%;
}

.file-grid-item-wrapper {
  padding: 8px;
  box-sizing: border-box;
  height: 200px;
}

.file-grid-item {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
  background-color: rgba(var(--v-theme-surface));
  box-shadow: none !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);

  &:hover {
    background-color: rgba(var(--v-theme-on-surface), 0.04);
  }

  &--selected,
  &--selected:hover {
    background-color: rgba(var(--v-theme-primary), 0.08) !important;
    border: 1px solid rgba(var(--v-theme-primary), 0.6);
  }
}

.file-grid-item-icon-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(var(--v-theme-on-surface), 0.04), rgba(var(--v-theme-on-surface), 0.01));
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  min-height: 0;
  padding: 16px;
}

.file-grid-item-icon {
  display: inline-block;
  object-fit: contain;
  max-height: 100px;
}

.file-grid-item-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.file-grid-item-name {
  font-size: 13px;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.9);
  line-height: 1.2;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: center;
}

.file-grid-item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.5);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size, .file-time {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
