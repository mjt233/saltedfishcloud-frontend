<template>
  <div ref="thisRef" class="download-task-manager d-flex flex-column">
    <!-- 顶部页签 -->
    <v-tabs
      v-if="isAdmin"
      v-model="activeTab"
      color="primary"
      @update:model-value="onTabChange"
    >
      <v-tab value="my">
        我的下载
      </v-tab>
      <v-tab value="public">
        公共下载
      </v-tab>
    </v-tabs>

    <div class="d-flex align-center px-4 py-2 flex-wrap">
      <!-- 创建任务按钮 (宽屏) -->
      <v-btn
        v-if="!isMobile"
        color="primary"
        class="mr-4"
        @click="openCreate"
      >
        <v-icon left>
          mdi-plus
        </v-icon>
        创建任务
      </v-btn>

      <!-- 状态筛选 -->
      <v-chip-group
        v-model="statusFilter"
        mandatory
        @update:model-value="loadList"
      >
        <v-chip
          v-for="status in statusOptions"
          :key="status.value"
          :value="status.value"
          :color="statusFilter === status.value ? 'primary' : undefined"
        >
          {{ status.label }}
        </v-chip>
      </v-chip-group>
    </div>

    <!-- 任务列表容器 -->
    <div ref="taskListContainerRef" class="task-list-container flex-grow-1 overflow-y-auto px-4 pb-4">
      <template v-if="listLoading">
        <v-skeleton-loader v-for="i in 3" :key="i" type="list-item-avatar-two-line" />
      </template>
      <template v-else-if="taskList.length === 0">
        <div class="d-flex justify-center align-center py-8 text-grey">
          暂无下载任务
        </div>
      </template>
      <v-virtual-scroll
        v-else
        :items="taskList"
        :height="targetHeight"
        item-height="104"
      >
        <template #default="{ item }">
          <v-sheet class="mt-2 mb-2 ml-1 mr-1" elevation="1" rounded>
            <download-task-manager-item
              :key="item.id"
              :item="item"
              @cancel="onCancelTask"
            />
          </v-sheet>
        </template>
      </v-virtual-scroll>
    </div>

    <!-- 悬浮创建按钮 (窄屏) -->
    <v-btn
      v-if="isMobile"
      color="primary"
      icon="mdi-plus"
      position="fixed"
      location="bottom right"
      style="bottom: 80px; right: 16px; z-index: 10"
      @click="openCreate"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { DownloadTaskInfo } from '../model'
import type { TaskType } from '../api'
import { downloadApi } from '../api'
import DownloadTaskManagerItem from './DownloadTaskManagerItem.vue'
import { DownloadTaskService } from '../service/DownloadTaskService'
import { useAutoComputeHeight } from 'sfc-common'

const SfcUtils = window.SfcUtils

/**
 * 下载任务管理组件 Props
 */
const props = defineProps({
  uid: {
    type: [String, Number],
    default: undefined
  }
})

const thisRef = ref<HTMLElement>()
const isMobile = ref(false)
const isAdmin = ref(false)
const activeTab = ref<'my' | 'public'>('my')
const statusFilter = ref<TaskType>('ALL')

const statusOptions: { value: TaskType, label: string }[] = [
  { value: 'ALL', label: '全部' },
  { value: 'DOWNLOADING', label: '进行中' },
  { value: 'FINISH', label: '已完成' },
  { value: 'FAILED', label: '已失败' }
]

const taskList = ref<DownloadTaskInfo[]>([])
const listLoading = ref(false)
const taskListContainerRef = ref<HTMLElement>()

const { targetHeight } =  useAutoComputeHeight({
  autoComputeHeight: true,
  computeTarget: () => taskListContainerRef.value as HTMLElement,
  observeTarget: document.body,
  offset: -16
})

let autoRefreshTimer: ReturnType<typeof setInterval> | null = null

/**
 * 获取当前登录用户信息
 */
const getSessionUser = () => {
  return window.getContext().session.value.user
}

/**
 * 获取当前查询的 uid
 */
const getQueryUid = () => {
  if (activeTab.value === 'public') {
    return 0
  }
  return props.uid ?? getSessionUser().id
}

/**
 * 判断任务是否处于进行中状态
 */
const isTaskInProgress = (task: DownloadTaskInfo): boolean => {
  return task.asyncTaskRecord?.status === 0 || task.asyncTaskRecord?.status === 1
}

/**
 * 请求任务列表，并按当前筛选条件进行排序
 */
const fetchTaskList = async(): Promise<DownloadTaskInfo[]> => {
  const uid = getQueryUid() as number | string
  const res = await SfcUtils.request(downloadApi.getTaskList(uid, statusFilter.value, 1, 300))
  const data = res.data as { data: { content: DownloadTaskInfo[] } }
  let list = data.data.content || []

  // 如果是全部筛选，则把"进行中"任务排到前面
  if (statusFilter.value === 'ALL') {
    list = list.slice().sort((a: DownloadTaskInfo, b: DownloadTaskInfo) => {
      const ia = isTaskInProgress(a) ? 0 : 1
      const ib = isTaskInProgress(b) ? 0 : 1
      return ia - ib
    })
  }

  return list
}

/**
 * 加载任务列表
 */
const loadList = async() => {
  try {
    listLoading.value = true
    taskList.value = await fetchTaskList()
  } catch (err) {
    console.error(err)
  } finally {
    listLoading.value = false
  }
}

/**
 * 标签切换时重新加载
 */
const onTabChange = () => {
  statusFilter.value = 'ALL'
  loadList()
}

/**
 * 后台自动加载（用于刷新速度、进度等），不带有 loading 效果
 */
let isAutoLoading = false
const autoLoadList = async() => {
  if (isAutoLoading) return
  try {
    isAutoLoading = true
    taskList.value = await fetchTaskList()
  } catch {
    // 忽略后台加载错误
  } finally {
    isAutoLoading = false
  }
}

/**
 * 取消任务
 */
const onCancelTask = async(taskId: string) => {
  try {
    await SfcUtils.loadingDialogTask({ msg: '正在取消任务...' },
      async() => {
        const uid = getQueryUid()
        await SfcUtils.request(downloadApi.interruptTask(uid as number | string, taskId))
        await SfcUtils.sleep(500)
        SfcUtils.snackbar('已取消任务')
        loadList()
      })
  } catch {
    SfcUtils.snackbar('取消任务失败')
  }
}

/**
 * 打开创建任务对话框
 */
const openCreate = () => {
  const uid = getQueryUid()
  // 使用 DownloadTaskService 打开创建对话框
  DownloadTaskService.openCreateTask(uid, '/', false, loadList)
}

onMounted(() => {
  const user = getSessionUser()
  isAdmin.value = user?.role === 'admin'
  if (!isAdmin.value) {
    activeTab.value = 'my'
  }
  loadList()
  autoRefreshTimer = setInterval(autoLoadList, 2000)
})

onUnmounted(() => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
  }
})
</script>

<style scoped>
.download-task-manager {
  background-color: var(--v-theme-surface);
}
.task-list-container {
  min-height: 200px;
}
</style>
