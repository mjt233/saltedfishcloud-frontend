<template>
  <v-list-item class="download-task-item py-3">
    <!-- 图标 -->
    <template #prepend>
      <div class="mr-4">
        <FileIcon :file-name="item.name || 'unknow'" style="width: 42px; height: 42px" />
      </div>
    </template>

    <!-- 主体内容 -->
    <v-list-item-title class="text-subtitle-1 font-weight-bold mb-1">
      {{ item.name }}
    </v-list-item-title>
    
    <v-list-item-subtitle class="text-caption text-truncate mb-1">
      <a
        :href="item.url"
        target="_blank"
        class="text-primary text-decoration-none"
        @click.stop
      >{{ item.url }}</a>
    </v-list-item-subtitle>
    
    <v-list-item-subtitle class="d-flex align-center mt-1">
      <!-- 文件大小 -->
      <span class="mr-4 text-grey">大小：{{ StringFormatter.toSize(item.size) }}</span>

      <!-- 进行中状态显示进度与速度 -->
      <template v-if="isInProgress">
        <span class="mr-4 text-primary font-weight-medium">
          速度：{{ StringFormatter.toSize(item.speed) }}/s
        </span>
        <span class="text-primary font-weight-medium mr-2">
          进度：{{ progressPercent }}%
        </span>
      </template>

      <!-- 状态标签 -->
      <v-chip
        size="small"
        :color="statusColor"
        class="ml-auto"
        variant="flat"
      >
        {{ statusText }}
      </v-chip>
    </v-list-item-subtitle>

    <!-- 进行中时显示进度条 -->
    <div v-if="isInProgress" class="mt-2">
      <v-progress-linear
        :model-value="progressPercent"
        color="primary"
        height="6"
        rounded
      />
    </div>

    <!-- 操作按钮 -->
    <template #append>
      <div class="d-flex align-center pl-4">
        <v-tooltip v-if="isInProgress" text="取消任务" location="bottom">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon="mdi-stop"
              variant="text"
              color="error"
              @click="onCancel"
            />
          </template>
        </v-tooltip>
      </div>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { DownloadTaskInfo } from 'sfc-common/model'
import { FileIcon } from 'sfc-common/components'
import { StringFormatter } from 'sfc-common/utils/StringFormatter'

/**
 * 下载任务列表项组件
 */
const props = defineProps({
  item: {
    type: Object as PropType<DownloadTaskInfo>,
    required: true
  }
})

const emit = defineEmits(['cancel'])

/**
 * 是否进行中
 */
const isInProgress = computed(() => {
  // 也可以通过 asyncTaskRecord.status: 0-等待 1-运行 2-成功 3-失败 4-取消
  const recordStatus = props.item.asyncTaskRecord?.status
  if (recordStatus === 0 || recordStatus === 1) {
    return true
  }

  return false
})

/**
 * 进度百分比
 */
const progressPercent = computed(() => {
  if (!props.item.size || props.item.size === 0) return 0
  const pct = Math.floor((props.item.loaded / props.item.size) * 100)
  return Math.min(100, Math.max(0, pct))
})

/**
 * 状态显示文本
 */
const statusText = computed(() => {
  if (isInProgress.value) return '进行中'
  const recordStatus = props.item.asyncTaskRecord?.status
  if (recordStatus === 2) return '已完成'
  if (recordStatus === 3) return '已失败'
  if (recordStatus === 4) return '已取消'
  return '未知'
})

/**
 * 状态颜色
 */
const statusColor = computed(() => {
  if (isInProgress.value) return 'primary'
  const recordStatus = props.item.asyncTaskRecord?.status
  if (recordStatus === 2) return 'success'
  if (recordStatus === 3) return 'error'
  if (recordStatus === 4) return 'grey'
  return 'grey'
})

/**
 * 取消任务事件
 */
const onCancel = () => {
  emit('cancel', props.item.id)
}
</script>

<script lang="ts">
export default defineComponent({
  name: 'DownloadTaskManagerItem'
})
</script>

<style scoped>
.download-task-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.download-task-item:last-child {
  border-bottom: none;
}
</style>
