<template>
  <VList ref="thisRef" class="file-explorer-file-list">
    <LoadingMask :loading="isLoading" />
    <VVirtualScroll
      v-if="fileList.length"
      ref="fileItemContainerRef"
      :height="(height || 400) - 16"
      :items="fileList"
      :item-key="itemKey"
      item-height="48"
      @click="containerClickFunction"
      @contextmenu="oncontextmenu"
    >
      <template #default="{ item }">
        <VListItem
          class="file-item cursor-default no-select"
          :class="{ 'selected-file-item': selectedSet.has(item.name) }"
          :title="item.name"
          :subtitle="StringFormatter.toSize(item.mtime)"
          :file-name="item.name"
          @dblclick="itemDoubleClickFunction($event); emits('fileClick', item)"
        >
          <template #prepend>
            <FileIcon
              class="mr-2"
              :width="32"
              :is-dir="item.dir"
              :file-name="item.name"
              :md5="item.md5"
              :height="32"
              :corner-icon="showMountIcon && item.mountId ? 'mdi-share' : undefined"
              :custom-thumbnail-url="customThumbnailUrl && customThumbnailUrl(item)"
            />
          </template>

          <template #subtitle>
            <VListItemSubtitle class="d-flex justify-space-between" style="font-size: 12px;">
              <span>{{ !item.dir ? StringFormatter.toSize(item.size) : '-' }}</span>
              <span>{{ StringFormatter.toDate(item.mtime) }}</span>
            </VListItemSubtitle>
          </template>
        </VListItem>
      </template>
    </VVirtualScroll>
    <div v-else class="text-center tip">
      {{ noDataText }}
    </div>
  </VList>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<FileExplorerViewProps>(), {
  itemKey: 'name'
})
const emits = defineEmits<FileExplorerViewEmits>()
const fileItemContainerRef = ref()
const thisRef = ref<any>()

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
    const fileItemDom = DOMUtils.getElParent(e.target as HTMLElement, el => el.classList.contains('file-item') && el.role == 'listitem' && !!el.getAttribute('file-name'))
    if (fileItemDom) {
      return fileItemDom.getAttribute('file-name')
    }
    return ''
  },
  multipleSelect: () => props.multipleSelect
})

const {
  noDataText
} = useFileViewText()

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

const exposeObj = getExpose({
  selectedList,
  selectedSet,
  fileList: () => props.fileList,
  fileItemLocator: {
    fileItemContainer: () => (fileItemContainerRef.value.$el as HTMLElement).querySelector('.v-virtual-scroll__container') as HTMLElement
  }
})
defineExpose(exposeObj)
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { FileExplorerViewEmits, FileExplorerViewProps } from './baseDefine'
import { getExpose, useFileListTypeToSearch, useFileSelect, useFileViewText } from './baseImpl'
import FileIcon from '../../FileIcon.vue'
import { DOMUtils, StringFormatter } from 'sfc-common/utils'
import LoadingMask from '../../LoadingMask.vue'

export default defineComponent({
  name: 'FileExplorerListView'
})
</script>


<style>
@import url('./baseStyle.scss');
</style>