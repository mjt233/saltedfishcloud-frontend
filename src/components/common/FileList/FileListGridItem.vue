<template>
  <div class="file-grid-item">
    <div class="item-icon">
      <file-icon
        :file-name="fileInfo?.name"
        :is-dir="fileInfo?.dir"
        :md5="fileInfo?.md5"
      />
    </div>
    <div class="item-name break-text">
      {{ fileInfo?.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import FileIcon from '../FileIcon.vue'
const props = defineProps({
  fileInfo: {
    type: Object as PropType<FileInfo>,
    default: undefined
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, PropType } from 'vue'
import { FileInfo } from '@/core/model'

export default defineComponent({
  name: 'FileListGridItem'
})
</script>

<style scoped lang="scss">
.file-grid-item {
  display: inline-flex;
  // justify-content: center;
  align-items: flex-start;
  flex-direction: column;
  // height: 120px;
  max-height: 145px;
  padding: 16px;
  width: 100%;
  .item-icon {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    height: 50%;
    width: 100%;
    margin: 0 auto;
    &>* {
      height: 48px;
    }
  }

  .item-name {
    width: 100%;
    font-size: 12px;
    text-align: center;
    max-height: 56px;
  }
}

</style>