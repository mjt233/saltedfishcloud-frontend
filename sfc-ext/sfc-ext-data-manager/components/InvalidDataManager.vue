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
        >
          <template #item.storagePath="{ item }">
            <span class="text-truncate d-inline-block" style="max-width: 200px" :title="item.storagePath">
              {{ item.storagePath }}
            </span>
          </template>

          <template #item.needIdentify="{ item }">
            <span :class="item.needIdentify ? 'text-warning' : 'text-success'">
              {{ item.needIdentify ? '是' : '无需识别' }}
            </span>
          </template>

          <template #item.fileSize="{ item }">
            {{ StringFormatter.toSize(item.fileSize) }}
          </template>

          <template #item.status=" { item }">
            <span :class="item.status == 'COMPLETED' ? 'text-success' : ''">
              {{ statusTitleMap[item.status] }}
            </span>
          </template>
          <template #item.fileType="{ item }">
            <span :class="item.fileType ? 'text-info' : 'text-muted'">
              {{ item.fileType ? typesNameMap[item.fileType] : '未知' }}
            </span>
          </template>

          <template #item.actions="{ item }">
            <v-btn
              v-if="item.status !== 'COMPLETED'"
              size="small"
              variant="text"
              color="success"
              @click="handleDownload(item)"
            >
              下载
            </v-btn>
            <v-btn
              size="small"
              variant="text"
              color="primary"
              @click="showDetail(item)"
            >
              详情
            </v-btn>
            <v-btn
              v-if="item.status === 'PENDING' && item.type === 'INVALID_FILE_RECORD'"
              size="small"
              variant="text"
              color="success"
              @click="handleQuickFix([item.id])"
            >
              修复
            </v-btn>
            <v-btn
              v-if="item.status === 'PENDING' && item.type === 'INVALID_STORAGE'"
              size="small"
              variant="text"
              color="primary"
              @click="openClaimDialog(item)"
            >
              认领
            </v-btn>
            <v-btn
              v-if="item.status === 'PENDING' && item.type === 'INVALID_STORAGE'"
              size="small"
              variant="text"
              color="info"
              @click="handlePublish(item)"
            >
              发布
            </v-btn>
            <v-btn
              v-if="item.status === 'PUBLISHED'"
              size="small"
              variant="text"
              color="warning"
              @click="handleUnpublish(item)"
            >
              取消发布
            </v-btn>
            <v-btn
              v-if="item.status === 'CLAIMED'"
              size="small"
              variant="text"
              color="primary"
              @click="handleMarkCompleted(item)"
            >
              完成
            </v-btn>
            <v-btn
              v-if="canDiscard(item)"
              size="small"
              variant="text"
              color="error"
              @click="handleDiscard([item.id])"
            >
              丢弃
            </v-btn>
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



  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
import { useInvalidDataList, statusOptions, headers, statusTitleMap } from '../composables/useInvalidDataList'
import { useInvalidDataActions } from '../composables/useInvalidDataActions'
import { DataManagerAPI } from '../api'
import InvalidDataDetail from './InvalidDataDetail.vue'
import type { InvalidDataRecord, FileMetadataDefine } from '../model'

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
 * 打开详情弹窗
 * @param item 要查看详情的失效数据记录
 */
const showDetail = (item: InvalidDataRecord) => {
  // 根据记录的 fileType 查找对应的 provider，获取其元数据定义
  const provider = providers.value.find(p => p.typeId === item.fileType)
  const metadataDefines: FileMetadataDefine[] = provider?.metadataDefines ?? []

  SfcUtils.openComponentDialog(InvalidDataDetail, {
    title: '失效数据详情',
    props: {
      item,
      metadataDefines,
      class: [ 'pl-2', 'pr-2', 'pt-2' ]
    },
    extraDialogOptions: {
      confirmText: '关闭',
      showCancel: false,
      dense: true
    }
  })
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
