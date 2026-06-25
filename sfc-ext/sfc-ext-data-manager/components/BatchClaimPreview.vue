<template>
  <div class="batch-claim-preview">
    <!-- 预览结果列表 -->
    <v-list
      density="compact"
      lines="three"
    >
      <template
        v-for="(item, index) in items"
        :key="item.invalidDataId"
      >
        <v-list-item>
          <v-list-item-title>源文件：{{ item.originalFileName }}</v-list-item-title>
          <v-list-item-subtitle>
            <div>保存目录：{{ item.resolvedPath }}</div>
            <div>保存文件名：{{ item.resolvedFileName }}</div>
          </v-list-item-subtitle>
          <template #append>
            <span class="text-caption text-medium-emphasis">
              {{ StringFormatter.toSize(item.fileSize) }}
            </span>
          </template>
        </v-list-item>
        <v-divider v-if="index < items.length - 1" />
      </template>
    </v-list>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
import { DataManagerAPI } from '../api'
import type { BatchClaimParam, ClaimPreviewItem } from '../model'

const SfcUtils = window.SfcUtils

const props = defineProps<{
/** 批量认领参数，包含筛选条件、保存路径、脚本等 */
  batchClaimParam: BatchClaimParam
/** 已加载的预览结果列表 */
  previewItems: ClaimPreviewItem[]
}>()

/** 错误信息 */
const errorMsg = ref('')

/** 预览结果列表 */
const items = ref<ClaimPreviewItem[]>(props.previewItems)

/**
 * 执行批量认领
 * 供外部对话框的 onConfirm 回调调用
 * @returns 执行是否成功
 */
const execute = async(): Promise<boolean> => {
  try {
    const res = await SfcUtils.loadingDialogTask({ msg: '正在执行批量认领...' }, async() => SfcUtils.request(DataManagerAPI.executeBatchClaim(props.batchClaimParam)))
    const result = res.data.data
    SfcUtils.snackbar(`批量认领完成：成功 ${result.successCount} 条，失败 ${result.failCount} 条`)
    return true
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e)
    SfcUtils.snackbar('批量认领失败：' + errMsg)
    return false
  }
}

defineExpose({ execute })
</script>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * 批量认领预览组件。
 *
 * 展示批量认领的预览结果列表（原始文件名、保存目录、保存文件名），
 * 并通过 `defineExpose` 暴露 `execute` 方法供外部对话框的确认按钮调用。
 */
export default defineComponent({
  name: 'BatchClaimPreview'
})
</script>

<style lang="scss" scoped>
.batch-claim-preview {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  position: relative;
}
</style>
