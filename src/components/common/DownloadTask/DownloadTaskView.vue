<template>
  <div>
    <loading-mask :loading="loading" />
    <v-tabs v-model="tab" fixed-tabs color="primary">
      <v-tab value="DOWNLOAD">
        下载中
      </v-tab>
      <v-tab value="FINISH">
        已完成
      </v-tab>
    </v-tabs>
    <v-window :model-value="tab" style="padding: 0 12px; height: 70vh; overflow-y: auto;">
      <v-window-item value="DOWNLOAD">
        <download-list :download-list="taskCollection.download" @cancel="actions.interruptTask($event)" />
      </v-window-item>
      <v-window-item value="FINISH">
        <download-list :download-list="taskCollection.finish" />
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
import LoadingMask from '../LoadingMask.vue'
import DownloadList from './DownloadList.vue'
const loadingManager = new LoadingManager()
let listLoading = false
const loading = loadingManager.getLoadingRef()
const props = defineProps({
  uid: {
    type: Number,
    default: 0
  }
})
const tab = ref() as Ref<DownloadTaskType>
const taskCollection = reactive({
  download: [] as DownloadTaskInfo[],
  finish: [] as DownloadTaskInfo[]
})
const loadList = async() => {
  if (listLoading) {
    return
  }
  try {
    listLoading = true
    const allList = (await SfcUtils.request(API.task.download.getTaskList(props.uid, 'ALL', 1, 15))).data.data
    taskCollection.download = allList.content.filter(e => e.state == 'DOWNLOADING' || e.state == 'WAITING')
    taskCollection.finish = allList.content.filter(e => e.state != 'DOWNLOADING' && e.state != 'WAITING')
  } finally {
    listLoading = false
  }
}

const actions = MethodInterceptor.createAsyncActionProxy({
  async loadList() {
    // 这里是为了让这里的支持
    return await loadList()
  },
  async interruptTask(id: string) {
    await SfcUtils.request(API.task.download.interruptTask(props.uid, id))
    setTimeout(() => {
      nextTick().then(actions.loadList)
      SfcUtils.snackbar(`已取消文件${taskCollection.download.find(e => e.id == id)?.name}的下载`)
    }, 300)
  }
}, false, loadingManager)

actions.loadList()
const timer = setInterval(loadList, 5000)
onUnmounted(() => {
  clearInterval(timer)
})

</script>

<script lang="ts">
import API from '@/api'
import { TaskType as DownloadTaskType } from '@/api/task'
import { DownloadTaskInfo } from '@/core/model/DownloadTask'
import { LoadingManager } from '@/utils/LoadingManager'
import SfcUtils from '@/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, reactive, toRefs, nextTick, onUnmounted } from 'vue'
import { MethodInterceptor } from '@/utils/MethodInterceptor'

export default defineComponent({
  name: 'DownloadTaskView'
})
</script>