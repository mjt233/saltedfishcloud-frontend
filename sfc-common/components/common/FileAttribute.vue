<template>
  <div>

    <div v-if="files.length > 1">
      <div>共计{{ files.length }}个文件</div>
    </div>
    <div v-else>
      <div class="d-flex">
        <div style="margin-right: 16px">
          <file-icon
            :file-name="files[0].name"
            :is-dir="files[0].dir"
            :md5="files[0].md5"
            :custom-thumbnail-url="thumbnailUrl"
            :width="48"
            :height="48"
          />
        </div>
        <div>{{ files[0].name }}</div>
      </div>
    </div>
    <form-grid
      style="padding-top: 32px;font-size: 14px;"
      label-width="120"
      row-height="64px"
    >
      <form-row>
        <form-col label="路径" top-label>
          {{ files.length == 1 ? StringUtils.appendPath(path, files[0].name) : path }}
        </form-col>
      </form-row>
      <form-row>
        <form-col label="大小" top-label>
          {{ size && StringFormatter.toSize(size) }}(不包含文件夹)
        </form-col>
        <form-col v-if="files.length == 1" label="修改日期" top-label>
          {{ StringFormatter.toDate(files[0].mtime || files[0].updateAt || files[0].createAt) }}
        </form-col>
        <form-col v-if="files.length == 1" :label="files[0].dir ? '节点id':'md5校验值'" top-label>
          {{ files[0].md5 || '不可用' }}
        </form-col>
        <form-col label="是否处于挂载目录" top-label>
          {{ files[0].isMount ? '是' : '否' }}
        </form-col>
      </form-row>
    </form-grid>

    <!-- 扩展段 -->
    <template v-for="(section, i) in extensionSections" :key="i">
      <v-divider style="margin: 16px 0 32px 0" />
      <div
        v-if="section.title"
        class="d-flex align-center"
        style="cursor: pointer; user-select: none;"
        @click="toggleSection(i)"
      >
        <v-icon :icon="expandedSections[i] ? 'mdi-chevron-down' : 'mdi-chevron-right'" size="24" style="margin-right: 8px" />
        <div class="text-title">
          {{ section.title }}
        </div>
      </div>
      <div v-show="expandedSections[i]" style="padding-top: 16px;">
        <component :is="section.component" v-bind="section.props ?? {}" />
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
const emits = defineEmits<{
  (event: 'mountPointLoaded', param: MountPoint): any
}>()
const props = defineProps({
  /**
   * 要展示的文件列表
   */
  files: {
    type: Array as PropType<FileInfo[]>,
    default: () => []
  },
  /**
   * 文件所在路径
   */
  path: {
    type: String,
    default: '/'
  },
  /**
   * 自定义的文件缩略图url
   */
  thumbnailUrl: {
    type: String,
    default: undefined
  },
  /**
   * 扩展属性段列表
   */
  extensionSections: {
    type: Array as PropType<FileAttributeSectionItem[]>,
    default: () => []
  }
})
const size = computed(() => {
  return props.files.filter(e => !e.dir).map(e => e.size).reduce((pre, cur) => Number(pre) + Number(cur), 0)
})
const showMountInfo = ref(false)
const expandedSections = ref<Record<number, boolean>>({})

const initializeExpandedSections = () => {
  const newState: Record<number, boolean> = {}
  props.extensionSections.forEach((section, index) => {
    newState[index] = section.defaultExpanded ?? false
  })
  expandedSections.value = newState
}

watch(() => props.extensionSections, initializeExpandedSections, { deep: true, immediate: true })

const toggleSection = (index: number) => {
  expandedSections.value[index] = !expandedSections.value[index]
}
</script>

<script lang="ts">
import { FileInfo, MountPoint } from 'sfc-common/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed, watch } from 'vue'
import { StringUtils } from 'sfc-common/utils/StringUtils'
import FileIcon from './FileIcon.vue'
import { FileAttributeSectionItem } from 'sfc-common/core'

export default defineComponent({
  name: 'FileAttribute'
})
</script>