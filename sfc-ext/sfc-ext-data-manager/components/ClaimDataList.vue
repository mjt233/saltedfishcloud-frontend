<template>
  <div class="claim-data-list">
    <div class="mb-4">
      <InvalidDataFilter
        :model-value="filterQueryProxy"
        :type-options="typeOptions"
        :status-options="[]"
        :provider-options="providerOptions"
        :types-name-map="typesNameMap"
        :hide-fields="['status']"
        @apply="onFilterApply"
      />
    </div>
    <v-data-table-server
      no-data-text="暂无可认领数据"
      mobile-breakpoint="md"
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
      @click:row="tableRowClick"
    >
      <template #item.fileName="{ value }">

        <span
          :title="value"
          class="text-truncate d-inline-block"
          style="max-width: 180px"
        >
          {{ value }}
        </span>
      </template>
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
        <v-btn size="small" color="primary" @click.stop="openClaimDialog(item)">
          认领
        </v-btn>
      </template>
    </v-data-table-server>
    <Teleport to="main">
      <v-navigation-drawer
        v-model="isShowDetail"
        location="right"
        :width="480"
      >
        <div class="d-flex justify-space-between pa-2">
          <span class="text-title-large">数据详情</span>
          <v-btn
            icon="mdi-close"
            density="compact"
            variant="text"
            @click="isShowDetail = false"
          />
        </div>
        <invalid-data-detail
          v-if="curDetailItem"
          :item="curDetailItem"
          :drawer-visible="isShowDetail"
          :metadata-defines="metadataDefines"
        />
        <div class="pl-4 pr-4">
          <v-btn
            v-if="$vuetify.display.mobile"
            color="primary"
            block
            @click="curDetailItem && openClaimDialog(curDetailItem)"
          >
            认领
          </v-btn>
        </div>
      </v-navigation-drawer>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, Ref, Teleport } from 'vue'
import { getContext, StringUtils, useCheckIsMobile, useEventBus } from 'sfc-common'
import { StringFormatter } from 'sfc-common'
import { DataManagerAPI } from '../api'
import { useInvalidDataList, typeOptions } from '../composables/useInvalidDataList'
import type { InvalidDataQuery, InvalidDataRecord, ClaimParam, InvalidDataFilterValue, FileMetadataDefine } from '../model'
import type { IdType } from 'sfc-common/model'
import InvalidDataClaimForm from './form/InvalidDataClaimForm.vue'
import InvalidDataFilter from './InvalidDataFilter.vue'

const context = getContext()
const SfcUtils = window.SfcUtils
const loading = ref(false)
const isAdmin = computed(() => context.session.value.user.role === 'admin')
const isShowDetail = ref(false)
const metadataDefines: Ref<FileMetadataDefine[]> = computed(() => {
  const propvider = providers.value.find(p => p.typeId == curDetailItem.value?.fileType)
  if (!propvider) {
    return []
  }
  return propvider.metadataDefines
})

/** 从 composable 中获取文件类型名称映射、识别器选项和加载方法 */
const { typesNameMap, providers, providerOptions, loadProviders } = useInvalidDataList()

/** 当前用户的UID */
const currentUid = context.session.value.user.id as IdType

/** 上次认领时使用的保存位置（targetUid），初始为当前用户UID */
const lastTargetUid = ref<IdType>(currentUid)

/** 上次认领时使用的保存路径，初始为根路径 */
const lastSavePath = ref('/')

/** 系统事件总线，当用户切换桌面时收起认领数据详情 */
const eventBus = useEventBus()
eventBus.on(EventNameConstants.DESKTOP_TAB_CHANGE, () => {
  curDetailItem.value = undefined
  isShowDetail.value = false
})

const curDetailItem = ref<InvalidDataRecord>()

const formatDate = (d: string) => {
  if (!d) return '-'
  return StringFormatter.toDate(d)
}

const query = reactive<InvalidDataQuery>({
  page: 1,
  size: 10,
  status: ['PUBLISHED'],
  fileType: undefined,
  minFileSize: undefined,
  maxFileSize: undefined,
  sortBy: undefined,
  sortOrder: undefined
})

const items = ref<InvalidDataRecord[]>([])
const total = ref(0)
/** 后端支持排序的字段集合 */
const sortableFields = new Set(['fileSize', 'lastModified'])

const headers: any[] = [
  { title: '文件名', key: 'fileName', sortable: false, value: (item: InvalidDataRecord) => {
    if (!item.storagePath) return '(未知)'
    const parts = item.storagePath.split('/')
    return parts[parts.length - 1]
  }},
  { title: '文件类型', key: 'fileType', sortable: false },
  { title: '大小', key: 'fileSize' },
  { title: '最后修改时间', key: 'lastModified' },
  { title: '操作', key: 'actions', sortable: false, align: 'end' }
]

/**
 * 筛选值代理，传给 InvalidDataFilter 组件，不含 status 字段
 */
const filterQueryProxy = computed<InvalidDataFilterValue>(() => ({
  fileType: query.fileType,
  minFileSize: query.minFileSize != null ? Number(query.minFileSize) : undefined,
  maxFileSize: query.maxFileSize != null ? Number(query.maxFileSize) : undefined
}))

/**
 * 筛选条件应用回调
 */
const onFilterApply = (value: InvalidDataFilterValue) => {
  query.fileType = value.fileType
  query.minFileSize = value.minFileSize
  query.maxFileSize = value.maxFileSize
  query.page = 1
  loadList()
}

const MIB_TO_BYTES = 1024 * 1024

/**
 * 加载列表，由 v-data-table-server 的 @update:options 事件触发
 * @param options 表格分页与排序选项
 */
const loadList = async(options?: {
  page?: number
  itemsPerPage?: number
  sortBy?: { key: string, order: string | boolean }[]
}) => {
  if (options) {
    query.page = options.page || 1
    query.size = options.itemsPerPage || 10
    if (options.sortBy && options.sortBy.length > 0) {
      const sortItem = options.sortBy[0]
      if (sortableFields.has(sortItem.key)) {
        query.sortBy = sortItem.key
        query.sortOrder = sortItem.order === 'asc' || sortItem.order === true ? 'ASC' : 'DESC'
      } else {
        query.sortBy = undefined
        query.sortOrder = undefined
      }
    } else {
      query.sortBy = undefined
      query.sortOrder = undefined
    }
  }
  loading.value = true
  try {
    const q: InvalidDataQuery = {
      ...query,
      minFileSize: query.minFileSize != null ? Math.floor(Number(query.minFileSize) * MIB_TO_BYTES) : undefined,
      maxFileSize: query.maxFileSize != null ? Math.floor(Number(query.maxFileSize) * MIB_TO_BYTES) : undefined
    }
    if (q.page) {
      q.page = Number(q.page) - 1
    }
    const res = (await SfcUtils.request(DataManagerAPI.publishedList(q))).data.data
    items.value = res.content
    total.value = parseInt(res.totalCount as any) || res.content.length
  } catch (err) {
    SfcUtils.snackbar('获取待认领列表失败：' + err)
  } finally {
    loading.value = false
  }
}
const isMobile = useCheckIsMobile()

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
        if (isMobile.value) {
          curDetailItem.value = undefined
          isShowDetail.value = false
        }
        await loadList()
      } else {
        SfcUtils.snackbar(ret.err)
      }
      return ret.success
    }
  })
}

function tableRowClick(e: Event, { item }: { item: InvalidDataRecord}) {
  curDetailItem.value = item
  isShowDetail.value = true
}

onMounted(() => {
  loadProviders()
  loadList()
})
</script>

<script lang="ts">
import { defineComponent } from 'vue'
import InvalidDataDetail from './InvalidDataDetail.vue'
import { EventNameConstants } from 'sfc-common/core/constans/EventName'

export default defineComponent({
  name: 'ClaimDataList'
})
</script>

<style scoped>
.claim-data-list {
  padding: 16px;
}
</style>
