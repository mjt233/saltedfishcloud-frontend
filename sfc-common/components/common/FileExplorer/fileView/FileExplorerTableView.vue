<template>
  <VDataTableVirtual
    ref="thisRef"
    v-model="selectedList"
    class="file-explorer-file-list"
    :items="fileList"
    hide-default-footer
    head
    fixed-header
    :height="height"
    :headers="tableHeaders"
    :loading="isLoading"
    color="primary"
    density="comfortable"
    :loading-text="loadingText"
    :no-data-text="noDataText"
    hover
    :item-value="itemValue"
    :row-props="getRawProps"
    :item-key="itemKey"
    @click="containerClickFunction"
    @contextmenu="oncontextmenu"
  >
    <template #item.name="{ value, item }">
      <div class="d-flex align-center">
        <FileIcon
          :is-dir="item.dir"
          use-thumb
          :file-name="value"
          :md5="item.md5"
          class="mr-2"
          :width="30"
          :height="30"
          :corner-icon="showMountIcon && item.mountId ? 'mdi-share' : undefined"
          :custom-thumbnail-url="customThumbnailUrl && customThumbnailUrl(item)"
        />
        <span class="file-name" :style="{ maxWidth: fileNameMaxWidth }">{{ value }}</span>
      </div>
    </template>
    <template #item.size="p">
      <span v-if="!p.item.dir" class="tip">{{ StringFormatter.toSize(p.item.size) }}</span>
      <span v-else>-</span>
    </template>
    <template v-for="slot in extraSlots" #[slot.slotName]="p">
      <slot :name="slot.slotName" v-bind="p">
        {{ p.item[slot.key] }}
      </slot>
    </template>
  </VDataTableVirtual>
</template>

<script setup lang="ts">
type HeaderItem = {title: string, key: string, width?: string, value?: (item: FileInfo) => string, [k: string]: any}
/* eslint-disable vue/require-explicit-emits */
const props = withDefaults(defineProps<FileExplorerViewProps & {
  extraHeaders?: HeaderItem[],
  headers?: HeaderItem[]
}>(), {
  itemKey: 'name',
  itemValue: 'name',
  headers: () => [
    { title: '名称', key: 'name', minWidth: '320px' },
    { title: '大小', key: 'size', width: '120px', minWidth: '120px' },
    { title: '修改时间', key: 'mtime', width: '180px', minWidth: '180px', value: (item:FileInfo) => StringFormatter.toDate(item.mtime)  },
  ]
})
const emits = defineEmits<FileExplorerViewEmits>()
const thisRef = ref()
const thisWidth = ref(0)
const fileNameMaxWidth = computed(() => {
  if (!thisWidth.value) {
    return undefined
  }
  return Math.max(320, (thisWidth.value - 380)) + 'px'
})
useResizeObserver(() => thisRef.value.$el, ({ 0: e}) => {
  thisWidth.value = e.target.clientWidth
})

// 文件选择功能
const {
  selectedList,
  selectedSet,
  itemDoubleClickFunction,
  containerClickFunction,
  oncontextmenu
} = useFileSelect({
  itemClickFileNameExtractor: e => {
    const tr = DOMUtils.getElParent(e.target as HTMLElement, el => el.tagName == 'TR')
    return tr?.getAttribute('file-name')
  },
  emits,
  fileList: () => props.fileList,
  multipleSelect: () => props.multipleSelect
})

// 通用文案
const { noDataText, loadingText } = useFileViewText()

// 文件列表键盘输入快速搜索
useFileListTypeToSearch({
  focusRoot: () => thisRef.value.$el as HTMLElement,
  fileList: () => props.fileList,
  selectedList,
  selectedSet,
  matchCallback(fileName) {
    exposeObj.scrollTo(fileName)
  },
})

// Ctrl+A 全选
useCtrlASelectAll({
  focusRoot: () => thisRef.value.$el as HTMLElement,
  onSelectAll() {
    selectedList.value = props.fileList.map(f => f.name)
  }
})

const tableHeaders = computed(() => {
  const headers = [
    ...props.headers,
    ...props.extraHeaders || []
  ]
  return headers
})

const extraSlots = computed(() => {
  if (!props.extraHeaders || props.extraHeaders.length == 0) {
    return []
  }
  return props.extraHeaders.map(e => {
    return {
      slotName: `item.${e.key}`,
      key: e.key
    }
  })
})

const getRawProps: RowPropsFunction<FileInfo> = (row) => {
  const c = ['file-item', 'cursor-default', 'no-select']
  if (selectedSet.value.has(row.item.name)) {
    c.push('selected-file-item')
  }
  return {
    class: c,
    'file-name': row.item.name,
    // 单行双击回调
    ondblclick(e: PointerEvent) {
      itemDoubleClickFunction(e)
      emits('fileClick', row.item)
    }
  }
}

const exposeObj = getExpose({
  selectedList,
  selectedSet,
  fileList: () => props.fileList,
  fileItemLocator: {
    scrollContainer: () => (thisRef.value.$el as HTMLElement).querySelector('.v-table__wrapper') as HTMLElement,
    fileItemContainer: () => (thisRef.value.$el as HTMLElement).querySelector('tbody') as HTMLElement
  }
})
defineExpose(exposeObj)
</script>

<script lang="ts">
import { FileInfo } from 'sfc-common/model'
import { DOMUtils, StringFormatter } from 'sfc-common/utils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed } from 'vue'
import type { FileExplorerViewEmits, FileExplorerViewProps } from './baseDefine'
type RowPropsFunction<T> = (data: { index: number, item: T, internalItem: unknown }) => Record<string, unknown>
import { getExpose, useFileListTypeToSearch, useFileSelect, useFileViewText, useCtrlASelectAll } from './baseImpl'
import { useResizeObserver } from 'sfc-common/composables/useResizeObserver'

export default defineComponent({
  name: 'FileExplorerTableView'
})
</script>

<style>
@import url('./baseStyle.scss');
</style>