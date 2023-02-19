<template>
  <div class="d-flex justify-center align-center upload-item">
    <div style="margin-right: 8px">
      <file-icon
        width="32"
        :md5="uploadInfo?.md5"
        :use-thumb="uploadInfo?.status == 'success'"
        :file-name="uploadInfo?.file.name"
        :is-dir="false"
      />
    </div>
    <div class="details">
      <div class="file-name">
        {{ uploadInfo?.file.name }}
      </div>
      <div class="file-size">
        状态：{{ getStatusText(uploadInfo?.status) }} 大小：{{ StringFormatter.toSize(uploadInfo?.file.size || 0) }}
        <span v-if="uploadInfo?.status == 'upload' || uploadInfo?.status == 'digest'">速度：{{ StringFormatter.toSize(progRecord.speed) }}/s</span>
        <span v-if="uploadInfo?.status == 'success'">
          平均速度：{{ StringFormatter.toSize(uploadInfo.file.size / ((uploadInfo.endDate.getTime() - uploadInfo.beginDate.getTime()) / 1000) ) }}/s
        </span>
      </div>
      <v-progress-linear
        v-show="uploadInfo?.status == 'upload' || uploadInfo?.status == 'pause' || uploadInfo?.status == 'digest'"
        :model-value="progVal"
        :indeterminate="uploadInfo?.status == 'digest'"
        style="width: 100%;margin-top: 8px;"
      />
    </div>
    <div class="handler">
      <v-icon
        v-show="showClose"
        v-ripple
        icon="mdi-close"
        @click="emits('close')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
const props = defineProps({
  uploadInfo: {
    type: Object as PropType<FileUploadInfo>,
    default: undefined
  },
  showClose: {
    type: Boolean,
    default: true
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

const getStatusText = (status?: FileUploadStatus) => {
  switch (status) {
  case 'digest':
    return '计算摘要中'
  case 'failed':
    return '失败'
  case 'interrupt':
    return '已取消'
  case 'pause':
    return '暂停'
  case 'success':
    return '上传成功'
  case 'upload':
    return '上传中'
  case 'wait':
    return '等待中'
  default:
    return '未知'
  }
}
</script>

<script lang="ts">
import { computed, defineComponent, defineProps, PropType, reactive, watch } from 'vue'
import { FileUploadInfo, FileUploadStatus } from 'sfc-common/core/serivce/FileUpload'
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