<template>
  <VContainer>
    <VTextField
      :model-value="apiKeyInfo.apiKey"
      label="MCP API Key"
      readonly
      variant="underlined"
      color="primary"
    >
      <template #append-inner>
        <VBtn
          variant="text"
          size="small"
          color="primary"
          @click="copyApiKey"
        >
          复制
        </VBtn>
      </template>
    </VTextField>
    <span class="tip">
      <p>提示：您有且仅有本次一次机会可查看该 API Key 原文，请在关闭前妥善保存。</p>
      <p>若遗失可重新生成新的 Key，旧 Key 也可在管理列表中手动撤销。</p>
    </span>
  </VContainer>
</template>

<script setup lang="ts">
/**
 * McpApiKeyRawInfo 组件属性。
 */
interface McpApiKeyRawInfoProps {
  /**
   * 新生成的 API Key 原文。
   */
  apiKeyInfo: McpApiKeyRawInfo
}

const props = defineProps<McpApiKeyRawInfoProps>()

/**
 * 复制新生成的 MCP API Key 原文。
 */
async function copyApiKey(): Promise<void> {
  const SfcUtils = window.SfcUtils
  await SfcUtils.copyToClipboard(props.apiKeyInfo.apiKey)
  SfcUtils.snackbar('已复制')
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'
import { type McpApiKeyRawInfo } from '../../model'

export default defineComponent({
  name: 'McpApiKeyRawInfo'
})
</script>
