import { ref, reactive } from 'vue'
import { DataManagerAPI } from '../api'
import type { InvalidDataQuery, InvalidDataRecord, InvalidDataRecordStatus } from '../model'

const SfcUtils = window.SfcUtils

/**
 * 失效数据列表状态选项
 */
export const statusOptions: { title: string, value: InvalidDataRecordStatus }[] = [
  { title: '待处理', value: 'PENDING' },
  { title: '已发布', value: 'PUBLISHED' },
  { title: '已认领', value: 'CLAIMED' },
  { title: '处理完成', value: 'COMPLETED' }
]

export const statusTitleMap: Record<InvalidDataRecordStatus, string> = {
  PENDING: '待处理',
  PUBLISHED: '已发布',
  CLAIMED: '已认领',
  COMPLETED: '处理完成'
}

/**
 * 失效数据表格列定义
 */
export const headers: any[] = [
  { title: '类型', key: 'type', value: (item: InvalidDataRecord) => item.type == 'INVALID_FILE_RECORD' ? '存储丢失' : '文件记录丢失' },
  { title: '存储模式', key: 'storeMode' },
  { title: '状态', key: 'status', value: (item: InvalidDataRecord) => statusTitleMap[item.status] },
  { title: '物理路径', key: 'storagePath' },
  { title: '待识别文件类型', key: 'needIdentify' },
  { title: '大小', key: 'fileSize' },
  { title: '操作', key: 'actions', sortable: false, align: 'end' }
]

/**
 * 失效数据列表管理 composable
 *
 * 负责列表的查询、分页、选中状态管理，以及文件类型识别器的加载。
 * @returns 列表相关的响应式状态与操作方法
 */
export function useInvalidDataList() {
  /** 加载状态 */
  const loading = ref(false)

  /** 查询参数（含分页） */
  const query = reactive<InvalidDataQuery & { page: number, size: number }>({
    page: 1,
    size: 10,
    status: undefined,
    fileType: undefined
  })

  /** 列表数据 */
  const items = ref<InvalidDataRecord[]>([])

  /** 总记录数 */
  const total = ref(0)

  /** 当前选中的记录ID列表 */
  const selected = ref<number[]>([])

  /** 文件类型识别器选项 */
  const providerOptions = ref<{ title: string, value: string }[]>([])

  /**
   * 加载列表数据，由 v-data-table-server 的 @update:options 事件触发
   * @param options 表格分页选项，包含 page 和 itemsPerPage
   */
  const loadList = async(options?: { page?: number, itemsPerPage?: number }) => {
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
      SfcUtils.snackbar('加载失败：' + err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载文件类型识别器选项列表
   */
  const loadProviders = async() => {
    try {
      const providers = (await SfcUtils.request(DataManagerAPI.listProviders())).data.data
      providerOptions.value = providers.map((p: any) => ({ title: p.typeName, value: p.typeId }))
    } catch (e) {
      console.warn(e)
    }
  }

  return {
    loading,
    query,
    items,
    total,
    selected,
    providerOptions,
    loadList,
    loadProviders
  }
}
