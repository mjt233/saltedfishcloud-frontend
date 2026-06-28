<template>
  <div ref="thisRef" class="invalid-data-manager">
    <div class="d-flex">
      <v-card ref="mainCardRef" style="flex: 1;">
        <!-- 桌面端：横向按钮栏 -->
        <v-card-title v-if="!isMobile" class="d-flex align-center">
          <VFadeTransition hide-on-leave>
            <div v-if="selected.length == 0" class="d-inline-flex align-center">
              <template v-for="action in actionItems" :key="action.id">
                <!-- 带子菜单的按钮组 -->
                <v-menu v-if="action.children">
                  <template #activator="{ props: activatorProps }">
                    <v-btn
                      v-bind="activatorProps"
                      class="mr-2"
                      variant="text"
                    >
                      <v-icon v-if="action.icon" start>
                        {{ action.icon }}
                      </v-icon>
                      {{ action.title }}
                      <v-icon end>
                        mdi-menu-down
                      </v-icon>
                    </v-btn>
                  </template>
                  <v-list density="comfortable">
                    <v-list-item
                      v-for="child in action.children"
                      :key="child.id"
                      :prepend-icon="child.icon"
                      :title="child.title"
                      :class="(child as any).class"
                      @click="child.action"
                    />
                  </v-list>
                </v-menu>
                <!-- 普通按钮 -->
                <v-btn
                  v-else
                  :color="action.color"
                  :icon="action.showText ? undefined : action.icon"
                  :class="{ 'mr-2': action.showText }"
                  :variant="action.showText ? undefined : 'text'"
                  :style="{ color: action.color == 'error' ? 'white' : undefined }"
                  @click="action.action"
                >
                  <template v-if="action.showText">
                    <v-icon v-if="action.icon" start>
                      {{ action.icon }}
                    </v-icon>
                    {{ action.title }}
                  </template>
                </v-btn>
              </template>
            </div>
            <div v-else class="d-flex align-center">
              <v-btn
                color="primary"
                class="mr-2"
                @click="handleBatchIdentify"
              >
                识别文件类型
              </v-btn>
              <v-btn
                color="primary"
                class="mr-2"
                :disabled="!canBatchFix"
                @click="handleBatchFix"
              >
                批量修复
              </v-btn>
              <v-btn
                class="mr-2"
                :disabled="!canBatchPublish"
                @click="handleBatchPublish"
              >
                批量发布
              </v-btn>
              <v-btn
                class="mr-2"
                :disabled="!canBatchUnpublish"
                @click="handleBatchUnpublish"
              >
                批量取消发布
              </v-btn>
              <v-btn
                color="error"
                style="color: white;"
                :disabled="!canBatchDiscard"
                @click="handleBatchDiscard"
              >
                批量丢弃
              </v-btn>
              <span class="tip ml-2" style="font-size: 12px;">已选 {{ selected.length }} 项</span>
            </div>
          </VFadeTransition>
          <VSpacer />
          <span style="font-size: 16px;" class="d-flex align-center text-primary cursor-pointer" @click="showHelp">
            <span>功能介绍</span> <VIcon icon="mdi-help-circle" /> </span>
        </v-card-title>
      
        <v-card-text>
          <!-- 筛选组件：桌面端展开式面板，移动端底部弹出 -->
          <InvalidDataFilter
            :model-value="filterQueryProxy"
            :type-options="typeOptions"
            :status-options="statusOptions"
            :provider-options="providerOptions"
            :types-name-map="typesNameMap"
            allow-groovy-script
            @apply="onFilterApply"
          />
          <v-data-table-server
            ref="tableRef"
            v-model="selected"
            :height="managerHeight + 'px'"
            :headers="headers"
            :items="items"
            :items-length="total"
            :loading="loading"
            :page="query.page"
            :items-per-page="query.size"
            :items-per-page-options="[10, 20, 50, 100]"
            items-per-page-text="每页大小"
            show-select
            hover
            mobile-breakpoint="md"
            @update:options="loadList"
            @click:row="tableRowClick"
          >
            <template #item.fileName="{ value }">
              <span
                :title="value"
                class="text-truncate d-inline-block"
                style="max-width: 140px"
              >
                {{ value }}
              </span>
            </template>
            <template #item.storagePath="{ item }">
              <v-tooltip location="top">
                <template #activator="{ props: tooltipProps }">
                  <span
                    v-bind="tooltipProps"
                    class="text-truncate d-inline-block cursor-pointer"
                    style="max-width: 180px"
                  >
                    {{ truncateHash(item.storagePath) }}
                  </span>
                </template>
                <div class="d-flex align-center" style="max-width: 400px; word-break: break-all">
                  <span class="mr-2">{{ item.storagePath }}</span>
                  <v-btn
                    icon="mdi-content-copy"
                    size="x-small"
                    variant="text"
                    @click.stop="copyToClipboard(item.storagePath)"
                  />
                </div>
              </v-tooltip>
            </template>

            <template #item.needIdentify="{ item }">
              <span :class="item.needIdentify ? 'text-warning' : 'text-success'">
                {{ item.needIdentify ? '是' : '无需识别' }}
              </span>
            </template>

            <template #item.fileSize="{ item }">
              {{ StringFormatter.toSize(item.fileSize) }}
            </template>

            <template #item.status="{ item }">
              <v-chip
                :color="statusChipColor[item.status]"
                size="small"
                variant="tonal"
              >
                {{ statusTitleMap[item.status] }}
              </v-chip>
            </template>
            <template #item.fileType="{ item }">
              <span :class="item.fileType ? 'text-info' : 'text-muted'">
                {{ item.fileType ? typesNameMap[item.fileType] : '未知' }}
              </span>
            </template>

            <template #item.lastModified="{ item }">
              {{ item.lastModified ? StringFormatter.toDate(item.lastModified) : '-' }}
            </template>

            <template #item.actions="{ item }">
              <InvalidDataActions
                class="justify-end "
                :item="item"
                variant="text"
                show-discard-popover
                @download="handleDownload(item)"
                @fix="handleQuickFix([item.id])"
                @claim="openClaimDialog(item)"
                @publish="handlePublish([item.id])"
                @unpublish="handleUnpublish([item.id])"
                @complete="handleMarkCompleted(item)"
                @discard="handleDiscard([item.id])"
              />
            </template>
          </v-data-table-server>
        </v-card-text>
      </v-card>

      <!-- 桌面端右侧卡片 -->
      <v-card
        v-if="drawerItem && !isMobile"
        class="ml-4 overflow-auto"
        style="width: 480px;"
        :style="{ maxHeight: mainCardHeight + 'px' }"
      >
        <v-card-title class="d-flex justify-space-between align-center">
          失效数据详情
          <v-btn
            variant="text"
            icon="mdi-close"
            density="comfortable"
            @click="drawerItem = null"
          />
        </v-card-title>
        <v-card-text>
          <InvalidDataDetail
            :item="drawerItem"
            :metadata-defines="drawerMetadataDefines"
            :drawer-visible="drawerVisible"
          />
        </v-card-text>
      </v-card>
    </div>

    <!-- 移动端：右下角悬浮操作按钮 -->
    <VFadeTransition>
      <v-fab
        v-if="isMobile"
        class="mr-3"
        color="primary"
        location="right bottom"
        size="large"
        icon
        app
        appear
      >
        <v-icon>mdi-tools</v-icon>
        <v-menu
          v-model="mobileMenuOpen"
          activator="parent"
          location="top"
          :close-on-content-click="false"
        >
          <v-list density="comfortable">
            <template v-for="action in actionItems" :key="action.id">
              <v-divider v-if="action.id === 'one-click-group'" />
              <!-- 带子菜单的分组项 -->
              <v-list-group v-if="action.children" :value="action.id">
                <template #activator="{ props: activatorProps, isOpen }">
                  <v-list-item
                    v-bind="activatorProps"
                    :prepend-icon="action.icon"
                    :title="action.title"
                  >
                    <template #append>
                      <v-icon>
                        {{ isOpen ? 'mdi-menu-up' : 'mdi-menu-down' }}
                      </v-icon>
                    </template>
                  </v-list-item>
                </template>
                <v-list-item
                  v-for="child in action.children"
                  :key="child.id"
                  :prepend-icon="child.icon"
                  :title="child.title"
                  :class="(child as any).class"
                  :disabled="loading"
                  @click="child.action(); mobileMenuOpen = false"
                />
              </v-list-group>
              <!-- 普通菜单项 -->
              <v-list-item
                v-else
                :prepend-icon="action.icon"
                :title="action.title"
                :disabled="loading"
                @click="action.action(); mobileMenuOpen = false"
              />
            </template>
          </v-list>
        </v-menu>
      </v-fab>
    </VFadeTransition>

    <!-- 移动端抽屉 -->
    <Teleport to="main">
      <v-navigation-drawer
        v-model="drawerVisible"
        location="right"
        temporary
        width="560"
        :scrim="true"
      >
        <v-card v-if="isMobile" flat class="overflow-auto">
          <v-card-title class="d-flex align-center justify-space-between">
            <span>失效数据详情</span>
            <v-btn
              icon="mdi-close"
              variant="text"
              size="small"
              @click="drawerVisible = false"
            />
          </v-card-title>
          <v-divider />
          <v-card-text v-if="drawerItem">
            <InvalidDataDetail
              :item="drawerItem"
              :metadata-defines="drawerMetadataDefines"
              :drawer-visible="drawerVisible"
            />
          </v-card-text>
          <v-divider />
          <v-card-actions v-if="drawerItem" class="px-4 py-3 drawer-actions">
            <InvalidDataActions
              :item="drawerItem"
              variant="tonal"
              @download="handleDownload(getDrawerItem())"
              @fix="withDrawerClose(() => handleQuickFix([getDrawerItem().id]))"
              @claim="openClaimDialog(getDrawerItem())"
              @publish="withDrawerClose(() => handlePublish([getDrawerItem().id]))"
              @unpublish="withDrawerClose(() => handleUnpublish([getDrawerItem().id]))"
              @complete="withDrawerClose(() => handleMarkCompleted(getDrawerItem()))"
              @discard="withDrawerClose(() => handleDiscard([getDrawerItem().id]))"
            />
          </v-card-actions>
        </v-card>
      </v-navigation-drawer>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Teleport } from 'vue'
import { useCheckIsMobile, getContext, JsonResult } from 'sfc-common'
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
import { useInvalidDataList, statusOptions, typeOptions, headers, statusTitleMap } from '../composables/useInvalidDataList'
import { useInvalidDataActions } from '../composables/useInvalidDataActions'
import { DataManagerAPI } from '../api'
import InvalidDataDetail from './InvalidDataDetail.vue'
import InvalidDataActions from './InvalidDataActions.vue'
import InvalidDataFilter from './InvalidDataFilter.vue'
import BatchClaimDialog from './BatchClaimDialog.vue'
import BatchClaimPreview from './BatchClaimPreview.vue'
import BatchByQueryForm from './form/BatchByQueryForm.vue'
import type { InvalidDataRecord, FileMetadataDefine, BatchClaimParam, ClaimPreviewItem, BatchResult } from '../model'
import type { InvalidDataFilterValue } from '../model'



// 表格组件引用
const tableRef = ref()
// 当前组件根元素引用
const thisRef = ref()
// 主表格外的卡片引用
const mainCardRef = ref()
const SfcUtils = window.SfcUtils

/** 是否为移动端窄屏 */
const isMobile = useCheckIsMobile()

/**
 * 操作按钮配置列表，桌面端和移动端共用
 * @property id - 唯一标识
 * @property icon - 图标名称
 * @property title - 按钮文本
 * @property action - 点击回调
 * @property color - 按钮颜色（仅桌面端生效）
 * @property showText - 桌面端是否显示文本（false 时仅显示图标）
 * @property children - 子菜单项列表，存在时该项渲染为下拉按钮组
 */
const actionItems = computed(() => [
  { id: 'detect', icon: 'mdi-radar', title: '开始检测', action: handleDetect, color: 'primary', showText: true },
  { id: 'identify', icon: 'mdi-file-search-outline', title: '识别文件类型', action: handleIdentify, showText: true },
  {
    id: 'by-query-group',
    icon: 'mdi-filter-variant',
    title: '按条件操作',
    showText: true,
    children: [
      { id: 'batch-claim', icon: 'mdi-account-multiple-plus', title: '按条件认领', action: handleBatchClaim },
      { id: 'batch-publish-by-query', icon: 'mdi-publish', title: '按条件发布', action: handleBatchPublishByQuery },
      { id: 'batch-unpublish-by-query', icon: 'mdi-cancel', title: '按条件取消发布', action: handleBatchUnpublishByQuery },
      { id: 'batch-discard-by-query', icon: 'mdi-delete-outline', title: '按条件丢弃', action: handleBatchDiscardByQuery }
    ]
  },
  {
    id: 'one-click-group',
    icon: 'mdi-auto-fix',
    title: '一键操作',
    showText: true,
    children: [
      { id: 'quick-fix-all', icon: 'mdi-auto-fix', title: '一键修复', action: handleQuickFixAll },
      { id: 'mark-claimed-completed', icon: 'mdi-check-all', title: '完成所有已认领', action: handleMarkClaimedCompleted },
      { id: 'clean-completed', icon: 'mdi-delete-sweep', title: '清理已完成记录', action: handleCleanCompleted },
      { id: 'discard-all', icon: 'mdi-delete-sweep-outline', title: '丢弃全部', action: handleDiscardAll, class: 'text-error' }
    ]
  },
  { id: 'refresh', icon: 'mdi-refresh', title: '刷新', action: doLoadList, showText: true }
])

/** 列表管理 */
const {
  loading,
  query,
  items,
  total,
  selected,
  providers,
  providerOptions,
  typesNameMap,
  loadList,
  loadProviders
} = useInvalidDataList()

const { targetHeight: managerHeight, updateHeight: updateManagerHeight } = useAutoComputeHeight({
  autoComputeHeight: true,
  computeTarget: () => tableRef.value.$el as HTMLElement,
  observeTarget: () => thisRef.value as HTMLElement,
  offset: -108
})
// 右侧卡片与左侧卡片高度同步
const mainCardHeight = useHeightSync(() => mainCardRef.value.$el)

/**
 * 筛选值代理，从 query 中提取筛选相关字段传给 InvalidDataFilter 组件
 * 使用 :model-value 单向传递，避免 v-model 双向绑定覆盖 query 的分页字段
 */
const filterQueryProxy = computed<InvalidDataFilterValue>(() => ({
  type: query.type,
  status: query.status,
  fileType: query.fileType,
  minFileSize: query.minFileSize,
  maxFileSize: query.maxFileSize,
  filterScript: query.filterScript
}))

/** 详情抽屉是否可见 */
const drawerVisible = ref(false)

/** 移动端悬浮按钮菜单是否展开 */
const mobileMenuOpen = ref(false)

/** 当前查看详情的记录 */
const drawerItem = ref<InvalidDataRecord | null>(null)



/** 操作管理 */
const {
  canDiscard,
  handleDetect,
  handleIdentify,
  handlePublish,
  handleUnpublish,
  handleMarkCompleted,
  handleQuickFix,
  handleQuickFixAll,
  handleDiscard,
  handleDiscardAll,
  handleMarkClaimedCompleted,
  handleCleanCompleted,
  openClaimDialog
} = useInvalidDataActions({ loading, loadList, selected })

/**
 * 打开详情抽屉
 * @param item 要查看详情的失效数据记录
 */
const openDrawer = (item: InvalidDataRecord) => {
  drawerItem.value = item
  drawerVisible.value = true
}

async function showHelp() {
  const content = (await import('../docs/help/invalid-data-manager.md?raw')).default
  SfcUtils.openComponentDialog(window.Components.MarkdownView, {
    props: {
      content
    },
    extraDialogOptions: {
      cancelText: '关闭',
      maxWidth: '810px'
    },
    title: '失效数据管理帮助文档',
    showConfirm: false
  })
}

/**
 * 获取当前抽屉记录的元数据定义列表
 * @param item 失效数据记录
 * @returns 对应文件类型的元数据定义数组
 */
const getMetadataDefines = (item: InvalidDataRecord): FileMetadataDefine[] => {
  const provider = providers.value.find(p => p.typeId === item.fileType)
  return provider?.metadataDefines ?? []
}

/**
 * 获取当前抽屉中的记录（非空），仅在 v-if="drawerItem" 后的安全上下文中调用
 * @returns 当前抽屉记录
 */
const getDrawerItem = (): InvalidDataRecord => drawerItem.value!

/**
 * 抽屉操作完成后关闭抽屉的通用回调
 * @param action 要执行的异步操作
 */
const withDrawerClose = (action: () => void) => {
  action()
  drawerVisible.value = false
}

const { isLoading, beginLoading, closeLoading } = useLoadingManager()


/**
 * 下载失效数据
 * @param item 要下载的失效数据记录
 */
const handleDownload = (item: InvalidDataRecord) => {
  const url = SfcUtils.getApiUrl(DataManagerAPI.download(item.id))
  window.open(url, '_blank')
}

/** 获取当前选中的记录列表 */
const getSelectedItems = () => {
  return items.value.filter(item => selected.value.includes(item.id))
}

/** 是否可批量修复 */
const canBatchFix = computed(() => {
  return selected.value.length > 0 && getSelectedItems().every(
    item => item.status === 'PENDING'
  )
})

/** 是否可批量丢弃 */
const canBatchDiscard = computed(() => {
  return selected.value.length > 0 && getSelectedItems().every(canDiscard)
})

/** 是否可批量发布（所有选中项均为 PENDING 且类型为 PHYSICAL_STORAGE） */
const canBatchPublish = computed(() => {
  return selected.value.length > 0 && getSelectedItems().every(
    item => item.status === 'PENDING' && item.type === 'PHYSICAL_STORAGE'
  )
})

/** 是否可批量取消发布（所有选中项均为 PUBLISHED） */
const canBatchUnpublish = computed(() => {
  return selected.value.length > 0 && getSelectedItems().every(
    item => item.status === 'PUBLISHED'
  )
})

/** 批量识别文件类型 */
const handleBatchIdentify = () => handleIdentify({ ids: selected.value })

/** 批量修复 */
const handleBatchFix = () => handleQuickFix(selected.value)

/** 批量发布 */
const handleBatchPublish = () => handlePublish(selected.value)

/** 批量取消发布 */
const handleBatchUnpublish = () => handleUnpublish(selected.value)

/** 批量丢弃 */
const handleBatchDiscard = () => handleDiscard(selected.value)

/**
 * 打开批量认领配置对话框
 * 用户配置筛选条件和保存路径后，点击"预览结果"打开预览对话框
 */
const handleBatchClaim = () => {
  const inst = SfcUtils.openComponentDialog(BatchClaimDialog, {
    title: '批量认领',
    props: {
      uid: getContext().session.value.user.id
    },
    extraDialogOptions: {
      confirmText: '预览结果',
      maxWidth: '900px',
      persistent: true
    },
    async onConfirm() {
      // 获取配置参数
      const param = (inst.getComponentInstRef() as InstanceType<typeof BatchClaimDialog>)?.getBatchClaimParam()
      if (!param) {
        SfcUtils.snackbar('获取配置参数失败')
        return false
      }

      // 先调用预览接口检查结果
      let previewItems: ClaimPreviewItem[]
      try {
        const res = await SfcUtils.loadingDialogTask({ msg: '正在查询预览结果...' }, async() => SfcUtils.request(DataManagerAPI.previewBatchClaim(param)))
        previewItems = res.data.data || []
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e)
        SfcUtils.snackbar('预览请求失败：' + errMsg)
        return false
      }

      // 预览结果为空时提示，不打开预览对话框
      if (previewItems.length === 0) {
        SfcUtils.alert('没有匹配的可认领数据，请调整筛选条件后重试。','提示')
        return false
      }

      // 打开预览对话框
      const previewInst = SfcUtils.openComponentDialog(BatchClaimPreview, {
        title: '批量认领预览',
        props: {
          batchClaimParam: param,
          previewItems
        },
        extraDialogOptions: {
          confirmText: '执行认领',
          maxWidth: '900px',
          persistent: true
        },
        async onConfirm() {
          const success = await (previewInst.getComponentInstRef() as InstanceType<typeof BatchClaimPreview>).execute()
          if (success) {
            doLoadList()
            // 认领成功后关闭批量认领配置对话框
            inst.close()
          }
          return success
        }
      })
      // 返回 false 保持批量认领配置对话框不关闭
      return false
    }
  })
}

/** 从当前列表筛选条件中提取非 status 的字段，用于 BatchByQueryForm 的默认值 */
const getQueryDefaultFilter = () => ({
  fileType: query.fileType,
  minFileSize: query.minFileSize,
  maxFileSize: query.maxFileSize,
  filterScript: query.filterScript
})

/**
 * 打开按条件批量发布对话框
 * 用户配置筛选条件后，点击确认直接执行批量发布操作
 */
const handleBatchPublishByQuery = () => {
  const inst = SfcUtils.openComponentDialog(BatchByQueryForm, {
    title: '按条件批量发布',
    props: {
      operationType: 'publish',
      defaultFilter: getQueryDefaultFilter()
    },
    extraDialogOptions: {
      maxWidth: '800px'
    },
    async onConfirm() {
      const form = inst.getInstAsForm()
      const ret = await SfcUtils.loadingDialogTask({msg: '执行中...'}, async() => await form.submit({ showError: false }))
      if (ret.success) {
        const batchResult = (ret.data as AxiosResponse<JsonResult<BatchResult>>).data.data
        if (batchResult) {
          SfcUtils.snackbar(`发布成功：${batchResult.success || 0}，失败：${batchResult.fail || 0}`)
        } else {
          SfcUtils.snackbar('发布操作已完成')
        }
        doLoadList()
        return true
      }
      return false
    }
  })
}

/**
 * 打开按条件批量取消发布对话框
 * 用户配置筛选条件后，点击确认直接执行批量取消发布操作
 */
const handleBatchUnpublishByQuery = () => {
  const inst = SfcUtils.openComponentDialog(BatchByQueryForm, {
    title: '按条件批量取消发布',
    props: {
      operationType: 'unpublish',
      defaultFilter: getQueryDefaultFilter()
    },
    extraDialogOptions: {
      maxWidth: '800px'
    },
    async onConfirm() {
      const form = inst.getInstAsForm()
      const ret = await SfcUtils.loadingDialogTask({msg: '执行中...'}, async() => await form.submit({ showError: false }))
      if (ret.success) {
        const batchResult = (ret.data as AxiosResponse<JsonResult<BatchResult>>).data.data
        if (batchResult) {
          SfcUtils.snackbar(`取消发布成功：${batchResult.success || 0}，失败：${batchResult.fail || 0}`)
        } else {
          SfcUtils.snackbar('取消发布操作已完成')
        }
        doLoadList()
        return true
      }
      return false
    }
  })
}

/**
 * 打开按条件批量丢弃对话框
 * 用户配置筛选条件后，点击确认先弹出二次确认，再执行批量丢弃操作
 */
const handleBatchDiscardByQuery = () => {
  const inst = SfcUtils.openComponentDialog(BatchByQueryForm, {
    title: '按条件批量丢弃',
    props: {
      operationType: 'discard',
      defaultFilter: getQueryDefaultFilter()
    },
    extraDialogOptions: {
      maxWidth: '800px'
    },
    async onConfirm() {
      // 二次确认：丢弃操作不可逆
      try {
        await SfcUtils.confirm('确定要按当前筛选条件批量丢弃数据吗？此操作不可逆！', '操作确认', { cancelToReject: true })
      } catch {
        return false
      }

      const form = inst.getInstAsForm()
      const ret = await SfcUtils.loadingDialogTask({msg: '执行中...'}, async() => await form.submit({ showError: false }))
      if (ret.success) {
        const batchResult = (ret.data as AxiosResponse<JsonResult<BatchResult>>).data.data
        if (batchResult) {
          SfcUtils.snackbar(`丢弃完成。成功：${batchResult.success || 0}，失败：${batchResult.fail || 0}`)
        } else {
          SfcUtils.snackbar('丢弃操作已完成')
        }
        doLoadList()
        return true
      }
      return false
    }
  })
}

/** 状态标签颜色映射 */
const statusChipColor: Record<string, string> = {
  PENDING: 'warning',
  PUBLISHED: 'info',
  CLAIMED: 'primary',
  COMPLETED: 'success'
}

/**
 * 截断过长的路径/Hash字符串，仅显示首尾各8个字符
 * @param str 原始字符串
 * @returns 截断后的字符串，短于20字符的原样返回
 */
const truncateHash = (str: string): string => {
  if (!str || str.length <= 20) return str
  const parts = str.split('/')
  const fileName = parts[parts.length - 1]
  if (fileName.length <= 20) return '.../' + fileName
  return fileName.substring(0, 8) + '...' + fileName.substring(fileName.length - 8)
}

const tableRowClick = (_event: Event, { item }: { item: InvalidDataRecord }) => {
  if (isMobile.value) {
    openDrawer(item)
  } else {
    drawerItem.value = item
  }
}

/**
 * 将文本复制到剪贴板
 * @param text 要复制的文本
 */
const copyToClipboard = async(text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    SfcUtils.snackbar('已复制到剪贴板')
  } catch {
    SfcUtils.snackbar('复制失败')
  }
}

/** 当前抽屉记录的元数据定义 */
const drawerMetadataDefines = computed((): FileMetadataDefine[] => {
  if (!drawerItem.value) return []
  return getMetadataDefines(drawerItem.value)
})

/**
 * 筛选条件应用回调
 * 由 InvalidDataFilter 组件在用户点击"应用"或移除筛选芯片时触发，
 * 将筛选值同步到 query 并重新加载列表
 * @param value 用户选定的筛选条件
 */
const onFilterApply = async(value: InvalidDataFilterValue) => {
  query.type = value.type
  query.status = value.status
  query.fileType = value.fileType
  query.minFileSize = value.minFileSize
  query.maxFileSize = value.maxFileSize
  query.filterScript = value.filterScript
  query.page = 1
  doLoadList()
}

const doLoadList = async() => {
  beginLoading()
  try {
    await loadList()
  } finally {
    closeLoading()
  }
}

/** 初始化：加载识别器选项和列表数据 */
onMounted(() => {
  loadProviders()
  doLoadList()
})
</script>

<script lang="ts">
import { defineComponent } from 'vue'
import { useAutoComputeHeight } from 'sfc-common'
import { useHeightSync } from '../composables/useHeightSync'
import { useLoadingManager } from 'sfc-common'
import { AxiosResponse } from 'axios'

export default defineComponent({
  name: 'InvalidDataManager'
})
</script>

<style lang="scss" scoped>
.invalid-data-manager {
  :deep(.v-data-table tbody tr) {
    cursor: pointer;
  }
}
</style>

<style lang="scss">
.drawer-actions {
  gap: 8px;
}
</style>


