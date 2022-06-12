<template>
  <div class="upload-list elevation-2" :class="{'hid': !show}">
    <v-tabs
      v-model="tab"
      fixed-tabs
    >
      <v-tab value="upload">
        上传中
      </v-tab>
      <v-tab value="finish">
        已完成
      </v-tab>
      <v-tab value="failed">
        传输失败
      </v-tab>
    </v-tabs>
    <div class="upload-info-list">
      <v-window :model-value="tab">
        <v-window-item value="upload">
          <file-upload-list :upload-info-list="uploadingExecutor.map(e => e.getUploadInfo())" @close="uploadClose" />
        </v-window-item>
        <v-window-item value="finish">
          <file-upload-list />
        </v-window-item>
        <v-window-item value="failed">
          <file-upload-list />
        </v-window-item>
      </v-window>
    </div>
  </div>
</template>

<script setup lang="ts">
import FileUploadList from './FileUploadList.vue'
const session = context.session
const tab = ref('upload')
const props = defineProps({
  show: {
    type: Boolean,
    default: true
  },
  taskManager: {
    type: Object as PropType<FileUploadTaskManager>,
    default: undefined
  }
})
const emits = defineEmits(['update:show'])
const uploadingExecutor = computed(() => {
  if (!props.taskManager) {
    return []
  } else {
    return props.taskManager.getAllExecutor()
  }
})
const finishList: FileUploadInfo[] = []
const uploadClose = (index: number) => {
  const executor = uploadingExecutor.value[index]
  if (executor.getUploadInfo().status == 'wait') {
    props.taskManager?.removeExecutor(executor.getId())
  } else {
    executor.interrupt()
  }
}
</script>

<script lang="ts">
import { defineComponent, ref, defineProps, defineEmits, computed, PropType } from 'vue'
import { context } from '@/core/context'
import { FileUploadInfo, FileUploadTaskManager } from '@/core/serivce/FileUpload'

export default defineComponent({
  name: 'FileUploadList'
})
</script>


<style lang="scss" scope>
.upload-list {
  position: fixed;
  top: 32px;
  z-index: 1100;
  right: 10px;
  width: calc(100% - 40px);
  height: calc(100% - 200px);
  max-width: 720px;
  margin: 20px;
  background-color: rgb(var(--v-theme-background));
  border: 1px solid rgba(var(--v-theme-primary), .2);
  transition: all .2s;
  &.hid {
    opacity: 0;
    transform: translateY(30px);
    pointer-events: none;
  }
}
.upload-info-list {
  height: calc(100% - 48px);
  overflow: auto;
}
</style>