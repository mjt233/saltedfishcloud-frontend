<template>
  <div>
    <div class="d-flex align-center flex-wrap ga-2 mb-3">
      <VBtn
        color="primary"
        :loading="isGenerating"
        @click="generateApiKey"
      >
        生成新 Key
      </VBtn>
      <VBtn
        color="primary"
        :loading="isLoading"
        variant="tonal"
        @click="refreshApiKeyList"
      >
        刷新
      </VBtn>
    </div>

    <VDataTable
      :loading="isLoading"
      loading-text="正在加载 MCP API Key 列表..."
      color="primary"
      :items="apiKeyList"
      :headers="headers"
      disable-sort
      mobile-breakpoint="md"
      hide-default-footer
      no-data-text="当前还没有 MCP API Key"
    >
      <template #item.createAt="{ item }">
        {{ StringFormatter.formatDate(item.createAt, 'yyyy-MM-dd hh:mm:ss') }}
      </template>
      <template #item.updateAt="{ item }">
        {{ StringFormatter.formatDate(item.updateAt, 'yyyy-MM-dd hh:mm:ss') }}
      </template>
      <template #item.actions="{ item }">
        <VBtn
          variant="text"
          color="primary"
          size="small"
          @click="renameApiKey(item)"
        >
          重命名
        </VBtn>
        <VBtn
          variant="text"
          color="error"
          size="small"
          @click="deleteApiKey(item)"
        >
          删除
        </VBtn>
      </template>
    </VDataTable>
  </div>
</template>

<script setup lang="ts">
const SfcUtils = window.SfcUtils
/**
 * McpApiKeyManager 组件属性。
 */
interface McpApiKeyManagerProps {
  /**
   * 当前用户ID，用于调用后端 rename 接口时进行归属校验。
   */
  uid: IdType
}

const props = defineProps<McpApiKeyManagerProps>()

const emit = defineEmits<{
  /**
   * 当新 API Key 生成成功后触发，回传原始 key 原文。
   * @param event 事件名
   * @param value 新生成的 MCP API Key 原文
   */
  (event: 'generated', value: string): void
}>()

/**
 * API Key 列表加载状态。
 */
const isLoading = ref(false)

/**
 * API Key 生成过程状态。
 */
const isGenerating = ref(false)

/**
 * 当前用户可见的 API Key 列表。
 */
const apiKeyList = ref<McpApiKeyVo[]>([])

/**
 * API Key 表格列定义。
 */
const headers = [
  { title: '名称', key: 'name', sortable: false },
  { title: 'API Key', key: 'maskedToken', sortable: false },
  { title: '创建时间', key: 'createAt', sortable: false },
  { title: '更新时间', key: 'updateAt', sortable: false },
  { title: '操作', key: 'actions', sortable: false }
]

/**
 * 加载当前用户的 MCP API Key 列表。
 */
async function refreshApiKeyList(): Promise<void> {
  isLoading.value = true
  try {
    const listData = (await SfcUtils.request(McpApiKeyApi.list())).data.data
    apiKeyList.value = listData ?? []
  } finally {
    isLoading.value = false
  }
}

/**
 * 生成 MCP API Key 前展示权限提醒弹窗。
 */
async function showGenerateAuthorityNotice(): Promise<void> {
  return new Promise((resolve, reject) => {
    SfcUtils.openComponentDialog(McpApiKeyAuthorityNotice, {
      title: '权限提醒',
      extraDialogOptions: {
        maxWidth: '810px',
        persistent: true,
        confirmText: '我已知晓并继续生成',
        cancelBtnText: '取消'
      },
      onConfirm() {
        resolve()
        return true
      },
      onCancel() {
        reject('cancel')
        return true
      }
    })
  })
}

/**
 * 打开输入框收集新 API Key 的名称。
 * @returns 用户输入的 Key 名称
 */
async function promptKeyName(): Promise<string> {
  return await SfcUtils.prompt({
    autofocus: true,
    title: '生成 MCP API Key',
    label: '请输入 Key 名称',
    rules: [
      Validators.notNull(),
      Validators.maxLen('名称不能超过20个字符', 20)
    ],
    defaultValue: 'default'
  })
}

/**
 * 生成新的 API Key，并弹窗展示原文供用户立即保存。
 */
async function generateApiKey(): Promise<void> {
  if (isGenerating.value) {
    return
  }

  await showGenerateAuthorityNotice()
  const keyName = await promptKeyName()
  isGenerating.value = true

  try {
    const generatedApiKeyData = (await SfcUtils.request(McpApiKeyApi.generate(keyName))).data.data
    if (!generatedApiKeyData) {
      throw new Error('生成 MCP API Key 失败，请稍后重试')
    }
    const generatedApiKey = generatedApiKeyData
    // 仅在生成成功的当次展示原文，关闭后无法再次查看。
    await SfcUtils.openComponentDialog(McpApiKeyRawInfo, {
      title: '新 MCP API Key',
      props: {
        apiKeyInfo: {
          apiKey: generatedApiKey
        }
      },
      extraDialogOptions: {
        maxWidth: '810px',
        persistent: true,
        confirmText: '好的，我已妥善保管',
        cancelBtnText: '关闭'
      },
      showCancel: false
    })

    emit('generated', generatedApiKey)
    SfcUtils.snackbar('MCP API Key 生成成功')
    await refreshApiKeyList()
  } catch (error) {
    if (error !== 'cancel') {
      SfcUtils.snackbar(String(error))
    }
  } finally {
    isGenerating.value = false
  }
}

/**
 * 删除指定的 API Key。
 * @param item 待删除的 API Key 条目
 */
async function deleteApiKey(item: McpApiKeyVo): Promise<void> {
  try {
    await SfcUtils.confirm('删除后该 Key 将立即失效，确认继续吗？', '删除确认', {
      cancelToReject: true,
      confirmBtnText: '确认删除',
      cancelBtnText: '取消'
    })
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    throw error
  }

  await SfcUtils.request(McpApiKeyApi.delete(item.id))
  SfcUtils.snackbar('删除成功')
  await refreshApiKeyList()
}

/**
 * 重命名指定的 API Key。
 * @param item 待重命名的 API Key 条目
 */
async function renameApiKey(item: McpApiKeyVo): Promise<void> {
  const newName = await SfcUtils.prompt({
    title: '重命名 MCP API Key',
    label: '请输入新的 Key 名称',
    rules: [
      Validators.notNull(),
      Validators.maxLen('名称不能超过20个字符', 20)
    ],
    defaultValue: item.name
  })

  await SfcUtils.request(McpApiKeyApi.rename(item.id, newName))
  SfcUtils.snackbar('重命名成功')
  await refreshApiKeyList()
}

/**
 * 监听用户上下文变化，并在变化后重新加载列表。
 */
watch(
  () => props.uid,
  () => {
    void refreshApiKeyList()
  },
  {
    immediate: true
  }
)
</script>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { Validators } from 'sfc-common/core'
import { type IdType } from 'sfc-common/model'
import { StringFormatter } from 'sfc-common/utils'
import { McpApiKeyApi } from '../../api'
import { type McpApiKeyVo } from '../../model'
import McpApiKeyAuthorityNotice from './McpApiKeyAuthorityNotice.vue'
import McpApiKeyRawInfo from './McpApiKeyRawInfo.vue'

export default defineComponent({
  name: 'McpApiKeyManager'
})
</script>
