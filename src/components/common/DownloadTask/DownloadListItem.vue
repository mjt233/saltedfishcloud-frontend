<template>
  <v-card>
    <v-card-content>
      <v-row justify="start">
        <v-col style="max-width: 56px;margin-left: 6px;" class="d-flex" cols="1">
          <file-icon :file-name="downloadTask.name || 'unknow'" />
        </v-col>
        <v-col cols="10" class="details">
          <div class="d-flex align-center">
            <span class="state" :class="downloadTask.state">{{ getStateText(downloadTask.state) }}</span>
            <div class="break-text file-name text-truncate text-primary" :title="downloadTask.name || 'unknow'">
              {{ downloadTask.name || 'unknow' }}
            </div>
          </div>
          <div class="url detail-text break-text text-truncate" :title="downloadTask.url">
            <a target="_blank" :href="downloadTask.url">{{ downloadTask.url }}</a>
          </div>
          <div class="detail-row detail-text">
            <!-- 进度条 -->
            <div v-if="downloadTask.state == 'DOWNLOADING'">
              <v-progress-linear
                :indeterminate="downloadTask.size == 0"
                :max="downloadTask.size"
                :model-value="downloadTask.loaded"
                color="primary"
              />
              <div class="d-flex justify-space-between align-center">
                <span>速度：{{ formatSize(downloadTask.speed) }}/s</span>
                <span>已完成：{{ formatSize(downloadTask.loaded) }}</span>
              </div>
            </div>
            <div class="d-flex justify-space-between align-center">
              <v-btn v-if="downloadTask.state == 'DOWNLOADING' || downloadTask.state == 'WAITING'" flat @click="emits('cancel', downloadTask.id)">
                取消
              </v-btn>
              <div>
                文件大小：{{ downloadTask.size == 0 ? '未知' : formatSize(downloadTask.size) }}
              </div>
              <div>
                创建于：{{ formatDate(downloadTask.createdAt) }}
              </div>
              <div v-if="downloadTask.finishAt">
                结束于：{{ formatDate(downloadTask.finishAt) }}
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-content>
  </v-card>
</template>

<script setup lang="ts">
import FileIcon from '../FileIcon.vue'
const props = defineProps({
  downloadTask: {
    type: Object as PropType<DownloadTaskInfo>,
    default: () => {}
  }
})
const formatSize = StringFormatter.toSize
const formatDate = StringFormatter.toDate
const getStateText = (e: DownloadTaskStatus) => {
  if (e == 'CANCEL') {
    return '已取消'
  } else if (e == 'DOWNLOADING') {
    return '下载中'
  } else if (e == 'FAILED') {
    return '失败'
  } else if (e == 'FINISH') {
    return '完成'
  } else if (e == 'WAITING') {
    return '等待中'
  }
}
const emits = defineEmits(['cancel'])
</script>

<script lang="ts">
import { DownloadTaskInfo, DownloadTaskStatus } from '@/core/model/DownloadTask'
import { defineComponent, defineProps, defineEmits, PropType } from 'vue'
import { StringFormatter } from '@/utils/StringFormatter'

export default defineComponent({
  name: 'DownloadListItem'
})
</script>

<style lang="scss" scoped>
.details>* {
  line-height: 24px;
}
.file-name {
  display: inline-block;
  font-size: 14px;
  font-weight: 600;
  max-width: calc(100% - 64px);
}
.url {
  cursor: pointer;
  &>a {
    color: #505050;
  }
}

.detail-text {
  font-size: 12px;
  color: #505050;
}

.state {
  font-size: 12px;
  margin-right: 8px;
  border-radius: 3px;
  padding: 6px;
  height: 21px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  color: rgb(255, 255, 255);
  background-color: rgb(var(--v-theme-info));
  &.FINISH {
    background-color: rgb(var(--v-theme-success));
  }
  &.CANCEL {
    background-color: rgb(var(--v-theme-warning));
  }
  &.FAILED {
    background-color: rgb(var(--v-theme-error));
  }

  &.DOWNLOADING {
    background-color: rgb(var(--v-theme-primary));
  }
}

.detail-row {
  margin-top: 12px;
  &>* {
    margin-top: 12px;
  }
}
</style>