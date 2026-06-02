<template>
  <VCard class="mcp-config" variant="text">
    <VCardText class="pa-1">
      <VRow>
        <VCol cols="12">
          <div class="text-h6 d-flex align-center mb-2">
            <VIcon icon="mdi-connection" class="mr-2" />
            MCP 配置
          </div>
        </VCol>
      </VRow>

      <VRow>
        <VCol cols="12">
          <div class="text-subtitle-1 mb-2">
            MCP API Key 管理
          </div>
          <McpApiKeyManager
            :uid="props.uid"
            @generated="handleApiKeyGenerated"
          />
        </VCol>
      </VRow>

      <VRow class="mt-8">
        <VCol cols="12">
          <div class="text-h5 mb-2">
            Agent MCP 接入案例说明
          </div>
          <VAlert
            v-if="!latestGeneratedApiKey"
            type="info"
            variant="tonal"
            class="mb-4"
          >
            当前展示的是占位符 &lt;YOUR_MCP_API_KEY&gt; 示例配置。生成新的 MCP API Key 后，说明会自动替换。
          </VAlert>
          <VExpansionPanels
            v-model="expandedPanels"
            multiple
          >
            <VExpansionPanel>
              <VExpansionPanelTitle class="text-subtitle-1">
                Claude Code
              </VExpansionPanelTitle>
              <VExpansionPanelText>
                <MarkdownView :content="configGuide" />
              </VExpansionPanelText>
            </VExpansionPanel>
          </VExpansionPanels>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { type IdType } from 'sfc-common/model'
import { computed, ref, watch } from 'vue'
import McpApiKeyManager from './McpApiKeyManager.vue'
const MarkdownView = window.Components.MarkdownView

/**
 * McpConfig 组件属性。
 */
interface McpConfigProps {
  /**
   * 当前查看配置的用户ID。
   * 该值用于感知用户上下文切换，并在切换后清理当前会话中的新生成 Key 原文。
   */
  uid: IdType
}

const props = defineProps<McpConfigProps>()

/**
 * 默认展示在说明中的 API Key 占位符。
 */
const defaultApiKeyPlaceholder = '<YOUR_MCP_API_KEY>'

/**
 * Claude Code 需要接入的 MCP 服务路径。
 */
const mcpServerPath = '/api/mcp/stream'

/**
 * Claude Code 实际需要配置的 MCP 服务完整地址。
 */
const mcpServerUrl = computed(() => new URL(mcpServerPath, location.origin).toString())

/**
 * 当前页面会话中最新生成成功的 MCP API Key 原文。
 */
const latestGeneratedApiKey = ref('')

/**
 * 接入说明展开面板下标集合。
 * 当前只有一个说明面板，使用 0 代表展开 Claude Code 说明。
 */
const expandedPanels = ref<number[]>([])

/**
 * 组装 Claude Code 的 MCP 配置说明文档。
 * @param apiKey 当前会话中新生成且尚可复制的 API Key 原文
 * @param serverUrl Claude Code 需要连接的 MCP 服务完整地址
 * @returns 用于 MarkdownView 渲染的 markdown 内容
 */
function buildConfigGuide(apiKey: string, serverUrl: string): string {
  const authorizationHeader = `Bearer ${apiKey}`
  const cliCommand = `claude mcp add xyy --transport http ${serverUrl} --header \"Authorization: ${authorizationHeader}\"`
  const configExample = {
    mcpServers: {
      xyy: {
        type: 'http',
        url: serverUrl,
        headers: {
          Authorization: authorizationHeader
        }
      }
    }
  }

  return [
    '将以下配置添加到 Claude Code 的 MCP 服务配置中。',
    '',
    '```json',
    JSON.stringify(configExample, null, 2),
    '```',
    '',
    `- MCP 服务器地址：\`${serverUrl}\``,
    `- 需要添加 Header：\`authorization: ${authorizationHeader}\``,
    '',
    '命令行添加参考：',
    '',
    '```bash',
    cliCommand,
    '```'
  ].join('\n')
}

/**
 * Claude Code 的配置说明 markdown。
 */
const configGuide = computed(() => {
  const activeApiKey = latestGeneratedApiKey.value || defaultApiKeyPlaceholder
  return buildConfigGuide(activeApiKey, mcpServerUrl.value)
})

/**
 * 记录最新生成成功的 API Key，并刷新当前配置说明。
 * @param apiKey 最新生成的 API Key 原文
 */
function handleApiKeyGenerated(apiKey: string): void {
  latestGeneratedApiKey.value = apiKey
  expandedPanels.value = [0]
}

/**
 * 监听用户上下文变化，切换用户时清理当前会话中的新生成 Key 原文。
 */
watch(
  () => props.uid,
  () => {
    latestGeneratedApiKey.value = ''
    expandedPanels.value = []
  },
  { immediate: true }
)
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'McpConfig'
})
</script>

<style scoped>
.mcp-config {
  width: 100%;
}

.markdown-wrapper :deep(.markdown-view) {
  height: 100%;
  padding: 16px;
  overflow: auto;
}
</style>