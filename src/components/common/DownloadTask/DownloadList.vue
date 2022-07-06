<template>
  <ul v-if="downloadList.length" class="task-list">
    <li v-for="item in downloadList" :key="item.id">
      <download-list-item :download-task="item" @cancel="emits('cancel', item.id)" />
    </li>
  </ul>
  <empty-tip v-else />
</template>

<script setup lang="ts">
import EmptyTip from '../EmptyTip.vue'
import DownloadListItem from './DownloadListItem.vue'
const props = defineProps({
  downloadList: {
    type: Array as PropType<DownloadTaskInfo[]>,
    default: () => []
  }
})
const emits = defineEmits(['cancel'])

</script>

<script lang="ts">
import { DownloadTaskInfo } from '@/core/model/DownloadTask'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'


export default defineComponent({
  name: 'DownloadList'
})
</script>

<style scoped lang="scss">
.task-list {
  list-style: none;
  &>li {
    margin: 12px 0;
  }
}
</style>