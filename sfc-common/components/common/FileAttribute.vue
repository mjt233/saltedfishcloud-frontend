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
            style="height: 48px;width: 48px;"
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
        <form-col v-if="files.length == 1" label="创建日期" top-label>
          {{ StringFormatter.toDate(files[0].createdAt) }}
        </form-col>
        <form-col v-if="files.length == 1" :label="files[0].dir ? '节点id':'md5校验值'" top-label>
          {{ files[0].md5 || '不可用' }}
        </form-col>
        <form-col label="是否处于挂载目录" top-label>
          {{ files[0].mount ? '是' : '否' }}
        </form-col>
      </form-row>
    </form-grid>
    
    <template v-if="files.length == 1 && files[0].mountId">
      <v-divider style="margin: 16px 0 32px 0" />
      
      <create-mount-point-form
        v-show="showMountInfo"
        :data-id="files[0].mountId"
        style="padding: 0"
        read-only
        @loaded="showMountInfo = true"
      />
    </template>
    
  </div>
</template>

<script setup lang="ts">
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
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
  }
})
const size = computed(() => {
  return props.files.filter(e => !e.dir).map(e => e.size).reduce((pre, cur) => Number(pre) + Number(cur), 0)
})
const showMountInfo = ref(false)
</script>

<script lang="ts">
import { FileInfo } from 'sfc-common/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed } from 'vue'
import { StringUtils } from 'sfc-common/utils/StringUtils'
import { context } from 'sfc-common/core/context'

export default defineComponent({
  name: 'FileAttribute'
})
</script>