<template>
  <div class="d-flex justify-center align-center upload-item">
    <div style="margin-right: 8px">
      <file-icon
        width="32"
        :use-thumb="false"
        :file-name="uploadInfo?.file.name"
        :is-dir="false"
      />
    </div>
    <div class="details">
      <div class="file-name">
        {{ uploadInfo?.file.name }}
      </div>
      <div class="file-size">
        速度：{{ StringFormatter.toSize(progRecord.speed) }} /s
        大小：{{ StringFormatter.toSize(uploadInfo?.file.size || 0) }}
        状态：{{ uploadInfo?.status }}
      </div>
      <v-progress-linear
        v-show="uploadInfo?.status != 'wait'"
        :model-value="progVal"
        :indeterminate="uploadInfo?.status == 'digest'"
        style="width: 100%;margin-top: 8px;"
      />
    </div>
    <div class="handler">
      <v-icon v-ripple icon="mdi-close" @click="emits('close')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { StringFormatter } from '@/utils/StringFormatter'
import FileIcon from '../FileIcon.vue'
const props = defineProps({
  uploadInfo: {
    type: Object as PropType<FileUploadInfo>,
    default: undefined
  }
})
const emits = defineEmits(['close'])
const progVal = computed(() => {
  if (!props.uploadInfo) {
    return 0
  } else {
    return (props.uploadInfo.prog.loaded / props.uploadInfo.prog.total) * 100
  }
})

const progRecord = reactive({
  time: new Date().getTime(),
  prog: {
    loaded: 0,
    total: 0
  },
  speed: 0
})
watch(() => props.uploadInfo?.prog.loaded || 0, () => {
  const size = props.uploadInfo?.prog.loaded || 0
  const time = new Date().getTime() - progRecord.time
  progRecord.speed = parseFloat((size / (time / 1000)).toFixed(2))
})
</script>

<script lang="ts">
import { computed, defineComponent, defineProps, PropType, reactive, watch } from 'vue'
import { FileUploadInfo } from '@/core/serivce/FileUpload'
import { Prog } from '@/utils/FileUtils/FileDataProcess'
export default defineComponent({
  name: 'FileUploadListItem'
})
</script>

<style scoped lang="scss">
.upload-item {
  height: 64px;
  width: 100%;
}
.details {
  font-size: 14px;
  width: 100%;
}
.file-name {
  font-size: 14px;
}

.handler {
  width: 32px;
  &>* {
    cursor: pointer;
    border-radius: 50%;
    padding: 16px;
  }
}
</style>