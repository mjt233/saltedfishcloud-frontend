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
        <empty-tip />
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
import { computed, ref, onMounted, onUnmounted, PropType, defineComponent } from 'vue'
import { IdType, DownloadTaskInfo } from 'sfc-common/model'
import { TaskType } from 'sfc-common/api/task'
import { getContext } from 'sfc-common/core/context'
import { useCheckIsMobile } from 'sfc-common/composables/useCheckIsMobile'
import { useAutoComputeHeight } from 'sfc-common/composables/useAutoComputeHeight'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import API from 'sfc-common/api'
import { EmptyTip } from 'sfc-common/components'
import { DownloadTaskService } from 'sfc-common/core/serivce/DownloadTaskService'
import DownloadTaskManagerItem from './DownloadTaskManagerItem.vue'

/**
 * 下载任务管理组件 Props
 */
const props = defineProps({
  uid: {
    type: [String, Number] as PropType<IdType>,
    default: undefined
  }
})
const thisRef = ref<HTMLElement>()
const isMobile = useCheckIsMobile()
const ctx = getContext()
const isAdmin = computed(() => ctx.session.value.user?.role === 'admin')

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
const { targetHeight } = useAutoComputeHeight({
  autoComputeHeight: true,
  computeTarget: () => taskListContainerRef.value as HTMLElement,
  observeTarget: () => thisRef.value as HTMLElement,
  offset: -16
})

let autoRefreshTimer: any = null

/**
 * 获取当前查询的 uid
 */
const getQueryUid = () => {
  if (activeTab.value === 'public') {
    // 即使被认为是 public，如果是管理员，公共区域一般 uid 为 0
    return 0
  }
  // 优先使用 props.uid 指定的用户，如果没有，则使用当前登录用户的 id
  return props.uid ?? ctx.session.value.user?.id
}

/**
 * 判断任务是否处于进行中状态
 * @param task 下载任务
 * @returns 是否进行中（0:等待中, 1:进行中）
 */
const isTaskInProgress = (task: DownloadTaskInfo): boolean => {
  return task.asyncTaskRecord?.status === 0 || task.asyncTaskRecord?.status === 1
}

/**
 * 请求任务列表，并按当前筛选条件进行排序
 * @returns 处理后的任务列表
 */
const fetchTaskList = async(): Promise<DownloadTaskInfo[]> => {
  const uid = getQueryUid()
  const res = await SfcUtils.request(API.task.download.getTaskList(uid as IdType, statusFilter.value, 1, 300))
  let list = res.data.data.content || []

  // 如果是全部筛选，则把“进行中”任务排到前面
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
  } catch (err) {
    // 忽略后台加载错误
  } finally {
    isAutoLoading = false
  }
}

/**
 * 取消任务
 * @param taskId 任务id
 */
const onCancelTask = async(taskId: string) => {
  try {
    await SfcUtils.loadingDialogTask({ msg: '正在取消任务...'},
      async() => {
        const uid = getQueryUid()
        await SfcUtils.request(API.task.download.interruptTask(uid as IdType, taskId))
        await SfcUtils.sleep(500)
        SfcUtils.snackbar('已取消任务')
        loadList()
      })
  } catch (err) {
    SfcUtils.snackbar('取消任务失败')
  }
}

/**
 * 打开创建任务对话框
 */
const openCreate = () => {
  const uid = getQueryUid()
  DownloadTaskService.openCreateTask(uid as IdType, '/', false, loadList)
}

onMounted(() => {
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

<script lang="ts">
export default defineComponent({
  name: 'DownloadTaskManager'
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
