<!-- 注：该组件大部分代码由AI生成 -->
<template>
  <div ref="thisRef">
    <div v-if="fileList.length" class="file-explorer-file-list file-grid-container" :style="{ height: height ? `${height}px` : 'auto' }">
      <div
        class="file-grid-wrapper"
        :style="{ height: height ? `${height}px` : '400px' }"
        @click="containerClickFunction"
        @contextmenu="oncontextmenu"
      >
        <div ref="fileItemContainerRef" class="file-grid">
          <div
            v-for="item in fileList"
            :key="item.name"
            class="file-grid-item-wrapper"
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
                  :width="64"
                  :height="64"
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
                  <span class="file-size">
                    {{ !item.dir ? StringFormatter.toSize(item.size) : '-' }}
                  </span>
                </div>
                <div class="file-grid-item-time">
                  {{ StringFormatter.toDate(item.mtime) }}
                </div>
              </div>
            </VCard>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="tip text-center">
      {{ noDataText }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<FileExplorerViewProps>()
const emits = defineEmits<FileExplorerViewEmits>()
const fileItemContainerRef = ref<HTMLElement>()
const thisRef = ref<HTMLElement>()
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
  multipleSelect: () => props.multipleSelect
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

const exposeObj = getExpose({
  selectedList,
  selectedSet,
  fileList: () => props.fileList,
  fileItemLocator: {
    fileItemContainer: () => fileItemContainerRef.value as HTMLElement
  }
})
defineExpose(exposeObj)
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, ref } from 'vue'
import { FileExplorerViewEmits, FileExplorerViewProps } from './baseDefine'
import { getExpose, useFileListTypeToSearch, useFileSelect, useFileViewText } from './baseImpl'
import FileIcon from '../../FileIcon.vue'
import { DOMUtils, StringFormatter } from 'sfc-common/utils'

export default defineComponent({
  name: 'FileExplorerGridView'
})
</script>

<style scoped lang="scss">

.file-grid-container {
  overflow: hidden;
}

.file-grid-wrapper {
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  width: 100%;
  
  @media (max-width: 1600px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
}

.file-grid-item-wrapper {
  display: flex;
  flex-direction: column;
  transition: all 0.2s;

  &.selected-file-item {
    .file-grid-item {
      border: 2px solid var(--v-primary);
    }
  }
}

.file-grid-item {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(var(--v-theme-on-surface), .1);
  }

  &--selected,&--selected:hover {
    background-color: rgba(var(--v-theme-primary), .15) !important;
  }
}

.file-grid-item-icon-wrapper {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(var(--v-theme-primary), 0.02));
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  flex-shrink: 0;
}

.file-grid-item-icon {
  display: inline-block;
}

.file-grid-item-info {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.file-grid-item-name {
  font-size: 12px;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.9);
  line-height: 1.3;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.file-grid-item-meta {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  display: inline-block;
}

.file-grid-item-time {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.5);
  line-height: 1.2;
  margin-top: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
