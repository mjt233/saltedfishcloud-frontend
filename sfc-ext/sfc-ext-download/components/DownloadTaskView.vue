<template>
  <div>
    <v-tabs v-model="tab" fixed-tabs color="primary">
      <v-tab value="DOWNLOAD">
        下载中{{ taskCollection.downloadCount && `(${taskCollection.downloadCount})` || '' }}
      </v-tab>
      <v-tab value="FINISH">
        已完成{{ taskCollection.finishCount && `(${taskCollection.finishCount})` || '' }}
      </v-tab>
    </v-tabs>
    <v-window :model-value="tab" style="padding: 0 12px; height: 70vh; overflow-y: auto;">
      <v-window-item value="DOWNLOAD">
        <download-list :download-list="taskCollection.download" @cancel="interruptTask" />
      </v-window-item>
      <v-window-item value="FINISH">
        <download-list :download-list="taskCollection.finish" />
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue'
import type { DownloadTaskInfo } from '../model'
import { downloadApi } from '../api'
import DownloadList from './DownloadList.vue'

const SfcUtils = window.SfcUtils

const props = defineProps({
  uid: {
    type: Number,
    default: 0
  }
})

type DownloadTaskType = 'DOWNLOAD' | 'FINISH'

const tab = ref<DownloadTaskType>('DOWNLOAD')
const taskCollection = reactive({
  download: [] as DownloadTaskInfo[],
  finish: [] as DownloadTaskInfo[],
  downloadCount: 0,
  finishCount: 0
})

const loadList = async() => {
  try {
    const res = await SfcUtils.request(downloadApi.getTaskList(props.uid, 'ALL', 1, 300))
    const data = res.data as { data: { content: DownloadTaskInfo[] } }
    const allList = data.data
    taskCollection.download = allList.content.filter(e => [0, 1].includes(e.asyncTaskRecord?.status))
    taskCollection.finish = allList.content.filter(e => !e.asyncTaskRecord || [2, 3].includes(e.asyncTaskRecord?.status))
    taskCollection.finishCount = taskCollection.finish.length
    taskCollection.downloadCount = taskCollection.download.length
  } catch {
    // 忽略加载错误
  }
}

const interruptTask = async(id: string) => {
  await SfcUtils.request(downloadApi.interruptTask(props.uid, id))
  await SfcUtils.sleep(500)
  await loadList()
  SfcUtils.snackbar(`已取消文件${taskCollection.download.find(e => e.id == id)?.name}的下载`)
}

loadList()
const timer = setInterval(loadList, 5000)

onUnmounted(() => {
  clearInterval(timer)
})
</script>
