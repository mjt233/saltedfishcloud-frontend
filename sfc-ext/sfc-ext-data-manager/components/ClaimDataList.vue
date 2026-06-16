<template>
  <div class="claim-data-list">
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
      <template #item.fileSize="{ item }">
        {{ StringFormatter.toSize(item.fileSize) }}
      </template>

      <template #item.fileType="{ item }">
        <span :class="item.fileType ? 'text-info' : 'text-muted'">
          {{ item.fileType ? typesNameMap[item.fileType] : '未知' }}
        </span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { getContext, StringUtils } from 'sfc-common'
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
import { DataManagerAPI } from '../api'
import { useInvalidDataList } from '../composables/useInvalidDataList'
import type { InvalidDataQuery, InvalidDataRecord, ClaimParam } from '../model'
import type { IdType } from 'sfc-common/model'
import InvalidDataClaimForm from './form/InvalidDataClaimForm.vue'

const context = getContext()
const SfcUtils = window.SfcUtils
const loading = ref(false)
const isAdmin = computed(() => context.session.value.user.role === 'admin')

/** 从 composable 中获取文件类型名称映射和加载方法 */
const { typesNameMap, loadProviders } = useInvalidDataList()

/** 当前用户的UID */
const currentUid = context.session.value.user.id as IdType

/** 上次认领时使用的保存位置（targetUid），初始为当前用户UID */
const lastTargetUid = ref<IdType>(currentUid)

/** 上次认领时使用的保存路径，初始为根路径 */
const lastSavePath = ref('/')

const formatDate = (d: string) => {
  if (!d) return '-'
  return StringFormatter.toDate(d)
}

const query = reactive<InvalidDataQuery>({
  page: 1,
  size: 10,
  status: ['PUBLISHED'] // 默认只查已发布的
})

const items = ref<InvalidDataRecord[]>([])
const total = ref(0)
const headers: any[] = [
  { title: '文件名', key: 'storagePath', sortable: false, value: (item: InvalidDataRecord) => {
    if (!item.storagePath) return '(未知)'
    const parts = item.storagePath.split('/')
    return parts[parts.length - 1]
  }},
  { title: '文件类型', key: 'fileType', sortable: false },
  { title: '大小', key: 'fileSize', sortable: false },
  { title: '最后修改时间', key: 'lastModified', sortable: false },
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
    const q = { ...query  } as InvalidDataQuery
    if (q.page) {
      q.page = Number(q.page) - 1
    }
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
  // 根据物理路径提取原始文件名
  const parts = item.storagePath?.split('/') || []
  const rawName = parts[parts.length - 1] || '未命名文件'

  // 尝试从类型检测结果中提取识别出的扩展名
  let extension = ''
  if (item.typeCheckResult) {
    try {
      const typeResult = JSON.parse(item.typeCheckResult)
      extension = typeResult?.detail?.extension || ''
    } catch {
      // 解析失败时不追加扩展名
    }
  }

  // 默认文件名：原始文件名 + 识别出的扩展名（若原始文件名已含该扩展名则不重复追加）
  let defaultName = rawName
  if (extension && !rawName.endsWith('.' + extension)) {
    defaultName = rawName + extension
  }

  const initObject: ClaimParam = {
    invalidDataId: item.id,
    targetUid: lastTargetUid.value,
    fileName: defaultName,
    savePath: lastSavePath.value
  }

  const inst = SfcUtils.openComponentDialog(InvalidDataClaimForm, {
    title: '认领数据',
    props: {
      uid: currentUid,
      initObject,
      showTargetUidSelector: isAdmin.value
    },
    extraDialogOptions: {
      confirmText: '提交认领'
    },
    async onConfirm() {
      const form = inst.getInstAsForm()
      const formData = form.getFormData() as ClaimParam
      const ret = await inst.getInstAsForm().submit()
      if (ret.success) {
        // 认领成功后记录本次使用的保存位置和路径，供下次认领复用
        lastTargetUid.value = formData.targetUid
        lastSavePath.value = formData.savePath
        SfcUtils.snackbar('认领成功！')
        await loadList()
      } else {
        SfcUtils.snackbar(ret.err)
      }
      return ret.success
    }
  })
}

onMounted(() => {
  loadProviders()
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
