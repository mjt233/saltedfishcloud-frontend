<!-- Windows资源管理器"平铺"视图风格的文件列表视图 -->
<template>
  <div ref="thisRef" style="position: relative;">
    <LoadingMask :loading="isLoading" :z-index="100" />
    <VVirtualScroll
      v-if="fileList.length"
      ref="fileItemContainerRef"
      class="file-tile-container"
      :height="height || 400"
      :items="fileRows"
      item-key="rowIndex"
      :item-height="TILE_ROW_HEIGHT"
      @click="containerClickFunction"
      @contextmenu="oncontextmenu"
    >
      <template #default="{ item: row }">
        <div class="file-tile-row">
          <div
            v-for="file in row.files"
            :key="file.name"
            class="file-tile-item cursor-default no-select"
            :class="{ 'file-tile-item--selected': selectedSet.has(file.name) }"
            :file-name="file.name"
            @dblclick="itemDoubleClickFunction($event); emits('fileClick', file)"
          >
            <div class="file-tile-icon-wrapper">
              <FileIcon
                class="file-tile-icon"
                :width="40"
                :height="40"
                :is-dir="file.dir"
                :file-name="file.name"
                :md5="file.md5"
                :corner-icon="showMountIcon && file.mountId ? 'mdi-share' : undefined"
                :custom-thumbnail-url="customThumbnailUrl && customThumbnailUrl(file)"
              />
            </div>
            <div class="file-tile-info">
              <div class="file-tile-name" :title="file.name">
                {{ file.name }}
              </div>
              <div class="file-tile-meta">
                <span class="file-tile-type">{{ getFileType(file) }}</span>
                <span class="file-tile-size">{{ !file.dir ? StringFormatter.toSize(file.size) : '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </VVirtualScroll>
    <div v-else class="text-center tip" :style="{minHeight: height ? (height + 'px') : undefined}">
      {{ noDataText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResizeObserver } from 'sfc-common/composables/useResizeObserver'

const props = withDefaults(defineProps<FileExplorerViewProps>(), {
  itemKey: 'name'
})
const emits = defineEmits<FileExplorerViewEmits>()
const fileItemContainerRef = ref()
const thisRef = ref<HTMLElement>()

// 平铺视图每行高度
const TILE_ROW_HEIGHT = 72
// 每个平铺项的宽度 + margin
const TILE_ITEM_WIDTH = 280 + 8

// 当前列数
const columnCount = ref(1)

// 计算每行可显示的文件数
function calculateColumnCount() {
  const container = fileItemContainerRef.value?.$el as HTMLElement
  if (!container) return 1
  const containerWidth = container.clientWidth  - 16 - 16 // 减去滚动容器padding 减去行padding
  return Math.max(1, Math.floor(containerWidth / TILE_ITEM_WIDTH))
}
function updateColumnCount() {
  columnCount.value = calculateColumnCount()
}

// 监听容器宽度变化
useResizeObserver(() => thisRef.value as HTMLElement, updateColumnCount)
watch(fileItemContainerRef, updateColumnCount)
onMounted(() => {
  updateColumnCount
})

// 将文件列表按行分组
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
    const fileItemDom = DOMUtils.getElParent(
      e.target as HTMLElement,
      el => el.classList.contains('file-tile-item') && !!el.getAttribute('file-name')
    )
    if (fileItemDom) {
      return fileItemDom.getAttribute('file-name')
    }
    return ''
  },
  multipleSelect: () => props.multipleSelect
})

const { noDataText } = useFileViewText()

/**
 * 获取文件类型（大写扩展名）
 */
function getFileType(item: FileInfo): string {
  if (item.dir) {
    return '文件夹'
  }
  const name = item.name
  const lastDotIndex = name.lastIndexOf('.')
  if (lastDotIndex === -1 || lastDotIndex === name.length - 1) {
    return '文件'
  }
  return name.slice(lastDotIndex + 1).toUpperCase()
}

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
    perRowHeight: TILE_ROW_HEIGHT
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
  name: 'FileExplorerTileView'
})
</script>

<style scoped lang="scss">
.file-tile-container {
  padding: 8px;
}

.file-tile-row {
  display: flex;
  flex-wrap: wrap;
  padding: 0 4px;
}

.file-tile-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin: 4px;
  border-radius: 6px;
  transition: background-color 0.15s ease;
  cursor: default;
  user-select: none;
  flex: 0 0 auto;
  width: 280px;
  height: 64px;
  box-sizing: border-box;

  &:hover {
    background-color: rgba(var(--v-theme-on-surface), 0.08);
  }

  &--selected,
  &--selected:hover {
    background-color: rgba(var(--v-theme-primary), 0.15) !important;
  }
}

.file-tile-icon-wrapper {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1), rgba(var(--v-theme-primary), 0.03));
  border-radius: 6px;
}

.file-tile-icon {
  display: block;
}

.file-tile-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.file-tile-name {
  font-size: 13px;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.9);
  line-height: 1.4;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.file-tile-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  overflow: hidden;
}

.file-tile-type {
  flex-shrink: 0;
  text-transform: uppercase;
  font-weight: 500;
}

.file-tile-size {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
