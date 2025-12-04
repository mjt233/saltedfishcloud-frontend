<template>
  <div class="align-center d-flex" @click="fileClick">
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
        <div class="file-name" :title="uploadInfo?.file.name">
          {{ uploadInfo?.file.name }}
        </div>
        <div class="file-size span-gap">
          <span>状态：{{ getStatusText(uploadInfo?.status) }}</span>
          <span v-if="uploadInfo?.status == 'failed'" class="ml-1">错误原因：{{ uploadInfo.errorReason }}</span>
          <span class="ml-1">大小：{{ StringFormatter.toSize(uploadInfo?.file.size || 0) }}</span>
          <span v-if="uploadInfo?.status == 'upload' || uploadInfo?.status == 'digest'" class="ml-1">速度：{{ StringFormatter.toSize(progRecord.speed) }}/s</span>
          <span v-if="uploadInfo?.status == 'success'" class="ml-1">
            平均速度：{{ StringFormatter.toSize(uploadInfo.file.size / ((uploadInfo.endDate.getTime() - uploadInfo.beginDate.getTime()) / 1000) ) }}/s
          </span>
        </div>
        <v-progress-linear
          v-show="uploadInfo?.status == 'upload' || uploadInfo?.status == 'pause' || uploadInfo?.status == 'digest'"
          :model-value="progVal"
          color="primary"
          style="width: 100%;margin-top: 8px;"
        />
      </div>
    </div>
    <div class="handler">
      <v-icon
        v-show="showClose"
        v-ripple
        icon="mdi-close"
        @click.stop.prevent="emits('close')"
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
let lastRecordTime = new Date().getTime()
let lastRecordLoaded = progRecord.prog.loaded

// 检查uploadInfo的loaded值变更，动态计算上传速度
watch(() => props.uploadInfo?.prog.loaded || 0, () => {
  // 更新固定属性 - 已完成数和目标总数
  const loaded = props.uploadInfo?.prog.loaded || 0
  progRecord.prog.loaded = loaded
  progRecord.prog.total = props.uploadInfo?.prog.total || 0

  const nowTime = new Date().getTime()

  // 计算本次更新与上次更新的时间间隔和大小变化
  const changeTimeSec = (nowTime - lastRecordTime) / 1000
  const changeSize = loaded - lastRecordLoaded

  // 记录本次计算时间和已完成大小，用作下次计算速度时作为参照点
  lastRecordTime = nowTime
  lastRecordLoaded = loaded

  // 计算速度
  progRecord.speed = changeTimeSec == 0 ? 0 : Number((changeSize /changeTimeSec).toFixed(2))
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

/**
 * 文件项被点击处理函数
 */
function fileClick() {
  if (props.uploadInfo?.status == 'failed') {
    console.error(props.uploadInfo.error)
  }
  SfcUtils.dialog({
    title: '文件信息',
    children() {
      return h('div', [
        h('p', `文件名:${props.uploadInfo?.file.name}`),
        h('p', `文件大小: ${StringFormatter.toSize(props.uploadInfo?.file.size)} (${props.uploadInfo?.file.size} Byte)`),
        props.uploadInfo?.status == 'interrupt' ? h('p', '任务已手动取消') : null,
        props.uploadInfo?.status == 'failed' ? h('p', `失败原因: ${props.uploadInfo?.errorReason}`) : null
      ].filter(e => e))
    },
    onCancel: () => true,
    onConfirm: () => true,
    extraProps: {
      showConfirm: false,
      cancelText: '关闭'
    }
  })
}

</script>

<script lang="ts">
import { computed, defineComponent, defineProps, h, PropType, reactive, watch } from 'vue'
import { FileUploadInfo, FileUploadStatus } from 'sfc-common/core/serivce/FileUpload'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { StringUtils } from 'sfc-common/utils'
export default defineComponent({
  name: 'FileUploadListItem'
})
</script>

<style scoped lang="scss">
.upload-item {
  height: 64px;
  width: calc(100% - 32px);
}
.details {
  font-size: 14px;
  width: calc(100% - 42px);
}
.file-name {
  font-size: 14px;
  display: block;
  height: 21px;
  max-height: 21px;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  word-wrap: break-word;
  white-space: pre;
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