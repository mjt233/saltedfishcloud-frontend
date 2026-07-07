<template>
  <ul v-if="downloadList.length" class="task-list">
    <li v-for="item in downloadList" :key="item.id">
      <download-list-item :download-task="item" @cancel="emits('cancel', item.id)" />
    </li>
  </ul>
  <div v-else class="d-flex justify-center align-center py-8 text-grey">
    暂无下载任务
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { DownloadTaskInfo } from '../model'
import DownloadListItem from './DownloadListItem.vue'

const props = defineProps({
  downloadList: {
    type: Array as PropType<DownloadTaskInfo[]>,
    default: () => []
  }
})

const emits = defineEmits(['cancel'])
</script>

<style scoped>
.task-list {
  list-style: none;
  &>li {
    margin: 12px 0;
  }
}
</style>
