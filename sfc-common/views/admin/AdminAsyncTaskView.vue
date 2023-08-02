<template>
  <div style="padding: 12px">
    <LoadingMask :loading="loading" />
    <h4 class="text-h5 text-primary" style="margin-bottom: 12px;">
      后台任务
    </h4>
    <div class="tool-bar d-flex align-center">
      <VBtn @click="actions.loadData">
        <CommonIcon icon="mdi-refresh" @click="actions.loadData" />刷新
      </VBtn>
    </div>
    <VCard>
      <VTable height="70vh" fixed-header>
        <thead>
          <tr>
            <th style="width: 64px;">
              序号
            </th>
            <th style="min-width: 120px">
              任务名
            </th>
            <th>
              执行节点
            </th>
            <th>
              日期
            </th>
            <th style="width: 120px">
              状态
            </th>
            <th style="width: 120px;z-index: 1;">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(task, index) in queryResult.content" :key="task.id">
            <td>{{ index + 1 + (page - 1 )* size }}</td>
            <td>{{ task.name }}</td>
            <td>{{ task.status == 0 ? '[-]' : task.executor }}</td>
            <td>
              <div class="tip">
                <div>发布于: {{ StringFormatter.toDate(task.createAt) }}</div>
                <div v-if="task.status != 0 && task.executeDate" class="status-text-1">
                  执行于: {{ StringFormatter.toDate(task.executeDate) }}
                </div>
                <div v-if="task.status == 2" class="status-text-2">
                  完成于: {{ StringFormatter.toDate(task.finishDate) }}
                </div>
                <div v-if="(task.status == 3 || task.status == 4) && task.failedDate" class="status-text-3">
                  失败于: {{ StringFormatter.toDate(task.failedDate) }}
                </div>
              </div>
            </td>
            <td><span :class="`status-text-${task.status}`">{{ AsyncTaskRecordStatusDict[task.status] || task.status }}</span></td>
            <td>
              <CommonIcon
                v-if="[2,3,4].includes(task.status)"
                v-ripple
                title="再次执行任务"
                class="simple-icon-btn"
                color="primary"
                icon="mdi-play"
                @click="rerun(task)"
              />
              <CommonIcon
                v-if="task.status != 0"
                v-ripple
                title="查看任务详情"
                class="simple-icon-btn"
                color="primary"
                icon="mdi-eye"
                @click="actions.showLog(task)"
              />
              <CommonIcon
                v-if="[0,1,5].includes(task.status)"
                v-ripple
                title="中断任务"
                class="simple-icon-btn"
                color="error"
                icon="mdi-stop"
                @click="interruptTask(task)"
              />
            </td>
          </tr>
        </tbody>
      </VTable>
      <CommonPagination
        v-model="page"
        v-model:page-size="size"
        :total-count="queryResult.totalCount"
        :total-page="queryResult.totalPage"
      />
    </VCard>
  </div>
</template>

<script setup lang="ts">
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()
const page = ref(1)
const size = ref(20)
const queryResult = reactive({
  content: [],
  totalCount: 0,
  totalPage: 0
}) as CommonPageInfo<AsyncTaskRecord>

const rerun = async(task: AsyncTaskRecord) => {
  await SfcUtils.confirm(`确定要再次执行任务${task.name}吗?`, '确认')
  actions.rerun(task)
}
const actions = MethodInterceptor.createAsyncActionProxy({
  async loadData() {
    const result = (await SfcUtils.request(API.asyncTask.listRecord({page: page.value - 1, size: size.value}))).data.data
    queryResult.totalCount = Number(result.totalCount)
    queryResult.totalPage = Number(result.totalPage)
    queryResult.content = result.content
    if (queryResult.totalPage < page.value) {
      page.value = queryResult.totalPage
    }
  },
  async showLog(task: AsyncTaskRecord) {
    SfcUtils.openComponentDialog(AsyncTaskInfo, {
      props: {
        taskId: task.id
      },
      title: `任务详情-${task.name}`,
      showCancel: false,
      extraDialogOptions: {
        maxWidth: '1280px'
      }
    })
  },
  async rerun(task: AsyncTaskRecord) {
    await SfcUtils.request(API.asyncTask.rerun(task.id))
    await SfcUtils.sleep(200)
    await this.loadData()
    SfcUtils.snackbar('操作成功')
  },
  async interruptTask(task: AsyncTaskRecord) {
    return await SfcUtils.request(API.asyncTask.interrupt(task.id))
  }
}, false, loadingManager)

/**
 * 中断执行中或待执行的任务
 * @param task 任务
 */
const interruptTask = (task: AsyncTaskRecord) => {
  SfcUtils.confirm('确定要中断该任务执行吗？', '中断确认')
    .then(() => actions.interruptTask(task))
    .then(actions.loadData)
}

watch(page, actions.loadData)
watch(size, actions.loadData)
onMounted(actions.loadData)
</script>

<script lang="ts">
import { CommonIcon } from 'sfc-common/components'
import AsyncTaskInfo from 'sfc-common/components/common/AsyncTask/AsyncTaskInfo.vue'
import CommonPagination from 'sfc-common/components/common/CommonPagination.vue'
import LoadingMask from 'sfc-common/components/common/LoadingMask.vue'
import { API, CommonPageInfo, IdType } from 'sfc-common/index'
import { AsyncTaskRecord, AsyncTaskRecordStatusDict } from 'sfc-common/model/AsyncTaskRecord'
import { LoadingManager, MethodInterceptor, StringFormatter } from 'sfc-common/utils'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, reactive, onMounted, watch } from 'vue'

export default defineComponent({
  name: 'AdminAsyncTaskView',
  components: { LoadingMask, CommonIcon, CommonPagination }
})
</script>


<style scoped lang="scss">
.status-text-1 {
  color: rgb(var(--v-theme-primary));
}
.status-text-2 {
  color: rgb(var(--v-theme-success));
}
.status-text-3 {
  color: rgb(var(--v-theme-error));
}

.status-text-4 {
  color: rgb(var(--v-theme-warning));
}

.simple-icon-btn {
  display: inline-block;
  cursor: pointer;
  border-radius: 50%;
  margin-right: 6px;
}

.tool-bar {
  margin-bottom: 12px;
}
</style>