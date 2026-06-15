<template>
  <div class="invalid-data-manager">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-btn
          color="primary"
          class="mr-2"
          :loading="loading"
          @click="handleDetect"
        >
          开始检测
        </v-btn>
        <v-btn
          class="mr-2"
          :loading="loading"
          @click="handleIdentify"
        >
          识别文件类型
        </v-btn>
        <v-btn
          color="error"
          class="mr-2"
          :loading="loading"
          @click="handleDiscardAll"
        >
          清理可丢弃
        </v-btn>
        <v-btn color="info" :loading="loading" @click="handleQuickFixAll">
          一键修复
        </v-btn>
        <v-btn icon="mdi-refresh" variant="text" @click="loadList" />
      </v-card-title>
      
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="4">
            <v-select
              v-model="query.status"
              :items="statusOptions"
              label="状态"
              class="mr-4"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="query.fileType"
              :items="providerOptions"
              label="文件类型"
              clearable
              hide-details
            />
          </v-col>
          <v-spacer />
        </v-row>

        <v-data-table-server
          v-model="selected"
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
          @click:row="(_event: any, { item }: any) => openDrawer(item)"
        >
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

          <template #item.actions="{ item }">
            <InvalidDataActions
              class="justify-end "
              :item="item"
              variant="text"
              show-discard-popover
              @download="handleDownload(item)"
              @fix="handleQuickFix([item.id])"
              @claim="openClaimDialog(item)"
              @publish="handlePublish(item)"
              @unpublish="handleUnpublish(item)"
              @complete="handleMarkCompleted(item)"
              @discard="handleDiscard([item.id])"
            >
              <template #prepend>
                <v-btn
                  variant="text"
                  size="small"
                  prepend-icon="mdi-information"
                >
                  详情
                </v-btn>
              </template>
            </InvalidDataActions>
          </template>
        </v-data-table-server>
        
        <div v-if="selected.length > 0" class="d-flex mt-4">
          <span class="mr-4 align-self-center">已选择 {{ selected.length }} 项</span>
          <v-btn
            color="primary"
            class="mr-2"
            :disabled="!canBatchFix"
            @click="handleBatchFix"
          >
            批量修复
          </v-btn>
          <v-btn color="error" :disabled="!canBatchDiscard" @click="handleBatchDiscard">
            批量丢弃
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- 详情侧边抽屉 -->
    <v-navigation-drawer
      v-model="drawerVisible"
      location="right"
      temporary
      width="560"
      :scrim="true"
      style="z-index: 9999;"
    >
      <v-card flat>
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
            @publish="withDrawerClose(() => handlePublish(getDrawerItem()))"
            @unpublish="withDrawerClose(() => handleUnpublish(getDrawerItem()))"
            @complete="withDrawerClose(() => handleMarkCompleted(getDrawerItem()))"
            @discard="withDrawerClose(() => handleDiscard([getDrawerItem().id]))"
          />
        </v-card-actions>
      </v-card>
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Teleport, watch } from 'vue'
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
import { useInvalidDataList, statusOptions, headers, statusTitleMap } from '../composables/useInvalidDataList'
import { useInvalidDataActions } from '../composables/useInvalidDataActions'
import { DataManagerAPI } from '../api'
import InvalidDataDetail from './InvalidDataDetail.vue'
import InvalidDataActions from './InvalidDataActions.vue'
import type { InvalidDataRecord, FileMetadataDefine } from '../model'
import type { IdType } from 'sfc-common/model'

const SfcUtils = window.SfcUtils

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

/** 详情抽屉是否可见 */
const drawerVisible = ref(false)

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

/** 批量修复 */
const handleBatchFix = () => handleQuickFix(selected.value)

/** 批量丢弃 */
const handleBatchDiscard = () => handleDiscard(selected.value)

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

watch([() => query.status, () => query.fileType], () => {
  loadList()
})

/** 初始化：加载识别器选项和列表数据 */
onMounted(() => {
  loadProviders()
  loadList()
})
</script>

<script lang="ts">
import { defineComponent } from 'vue'

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


