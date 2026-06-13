<template>
  <div class="claim-data-list">
    <v-card>
      <v-card-title>
        待认领数据
        <v-spacer />
        <v-btn icon="mdi-refresh" variant="text" @click="loadList" />
      </v-card-title>
      
      <v-card-text>
        <v-data-table-server
          :headers="headers"
          :items="items"
          :items-length="total"
          :loading="loading"
          :page="query.page"
          :items-per-page="query.size"
          :items-per-page-options="[10, 20, 50, 100]"
          items-per-page-text="每页大小"
          hover
          @update:options="loadList"
        >
          <template #item.storagePath="{ item }">
            <span class="text-truncate d-inline-block" style="max-width: 250px" :title="item.storagePath">
              {{ item.storagePath }}
            </span>
          </template>

          <template #item.fileSize="{ item }">
            {{ StringFormatter.toSize(item.fileSize) }}
          </template>

          <template #item.lastModified="{ item }">
            {{ formatDate(item.lastModified) }}
          </template>

          <template #item.actions="{ item }">
            <v-btn size="small" color="primary" @click="openClaimDialog(item)">
              认领
            </v-btn>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { getContext } from 'sfc-common'
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
import { DataManagerAPI } from '../api'
import type { InvalidDataQuery, InvalidDataRecord, ClaimParam } from '../model'
import InvalidDataClaimForm from './form/InvalidDataClaimForm.vue'

const context = getContext()
const SfcUtils = window.SfcUtils
const loading = ref(false)
const isAdmin = computed(() => context.session.value.user.role === 'admin')

const formatDate = (d: string) => {
  if (!d) return '-'
  return new Date(d).toLocaleString()
}

const query = reactive<InvalidDataQuery & { page: number, size: number }>({
  page: 1,
  size: 10,
  status: 'PUBLISHED' // 默认只查已发布的
})

const items = ref<InvalidDataRecord[]>([])
const total = ref(0)
const headers: any[] = [
  { title: 'ID', key: 'id' },
  { title: '文件类型', key: 'fileType' },
  { title: '物理路径提取', key: 'storagePath' },
  { title: '大小', key: 'fileSize' },
  { title: '最后修改时间', key: 'lastModified' },
  { title: '操作', key: 'actions', sortable: false, align: 'end' }
]

/**
 * 加载列表，由 v-data-table-server 的 @update:options 事件触发
 * @param options 表格分页选项，包含 page 和 itemsPerPage
 */
const loadList = async(options?: { page?: number, itemsPerPage?: number }) => {
  // 从表格事件中同步分页参数
  if (options) {
    query.page = options.page || 1
    query.size = options.itemsPerPage || 10
  }
  loading.value = true
  try {
    const q = { ...query }
    q.page = q.page - 1
    const res = (await SfcUtils.request(DataManagerAPI.list(q))).data.data
    items.value = res.content
    total.value = parseInt(res.totalCount as any) || res.content.length
  } catch (err) {
    SfcUtils.snackbar('获取待认领列表失败：' + err)
  } finally {
    loading.value = false
  }
}

const openClaimDialog = (item: InvalidDataRecord) => {
  const currentUid = context.session.value.user.id as number

  // 根据物理路径提取一个默认文件名
  const parts = item.storagePath?.split('/') || []
  const defaultName = parts[parts.length - 1] || '未命名文件'

  const initObject: ClaimParam = {
    invalidDataId: item.id,
    targetUid: currentUid,
    fileName: defaultName,
    savePath: '/'
  }

  const inst = SfcUtils.openComponentDialog(InvalidDataClaimForm, {
    title: '认领数据',
    props: {
      uid: currentUid,
      initObject,
      showTargetUidSelector: isAdmin.value,
      targetUidOptions: [
        { title: '我的私人网盘', value: currentUid },
        { title: '公共网盘', value: 0 }
      ]
    },
    extraDialogOptions: {
      confirmText: '提交认领'
    },
    async onConfirm() {
      const ret = await inst.getInstAsForm().submit()
      if (ret.success) {
        SfcUtils.snackbar('认领成功！')
        await loadList()
      }
      return ret.success
    }
  })
}

onMounted(() => {
  loadList()
})
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ClaimDataList'
})
</script>

<style scoped>
.claim-data-list {
  padding: 16px;
}
</style>
