<template>
  <VDataTableVirtual
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
    item-value="name"
    :row-props="getRawProps"
    item-key="name"
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
          :width="24"
        /> {{ value }}
      </div>
    </template>
    <template #item.size="p">
      <span v-if="!p.item.dir" class="tip">{{ StringFormatter.toSize(p.item.size) }}</span>
      <span v-else>-</span>
    </template>
  </VDataTableVirtual>
</template>

<script setup lang="ts">
/* eslint-disable vue/require-explicit-emits */
const props = defineProps<FileExplorerListProps>()
const emits = defineEmits<FileExplorerListEmits>()

const {
  selectedList,
  selectedSet,
  loadingText,
  noDataText,
  itemDoubleClickFunction,
  containerClickFunction,
  oncontextmenu
} = useFileSelect({
  itemClickFileNameExtractor: (e: PointerEvent) => {
    const tr = DOMUtils.getElParent(e.target as HTMLElement, el => el.tagName == 'TR')
    return tr?.getAttribute('file-name')
  },
  emits,
  fileList: () => props.fileList
})

const tableHeaders = computed(() => {
  const headers = [
    { title: '名称', key: 'name' },
    { title: '大小', key: 'size', width: '120px' },
    { title: '修改时间', key: 'mtime', width: '180px', value: (item:FileInfo) => StringFormatter.toDate(item.mtime)  }
  ]
  return headers
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

defineExpose(getExpose({
  selectedList,
  selectedSet,
  fileList: () => props.fileList
}))
</script>

<script lang="ts">
import { FileInfo, FileListContext, IdType } from 'sfc-common/model'
import { DOMUtils, StringFormatter } from 'sfc-common/utils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed } from 'vue'
import type { FileExplorerListEmits, FileExplorerListProps } from './baseDefine'
import type { RowPropsFunction } from 'vuetify/lib/components/VDataTable/types'
import { getExpose, useFileSelect } from './baseImpl'

export default defineComponent({
  name: 'FileExplorerTable'
})
</script>

<style>
@import url('./baseStyle.scss');
</style>