<template>
  <VCard class="mcp-config pa-4" variant="text">
    <VCardText>
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
          <VAlert v-if="errorMessage" type="error" variant="tonal">
            {{ errorMessage }}
          </VAlert>
          <VAlert v-else-if="isLoading" type="info" variant="tonal">
            <div class="d-flex align-center">
              <VProgressCircular
                indeterminate
                size="18"
                width="2"
                class="mr-3"
              />
              正在查询当前用户的 MCP ApiTicket...
            </div>
          </VAlert>
          <template v-else-if="!apiTicket">

            <VAlert type="warning" variant="tonal">
              当前用户还没有可用的 MCP ApiTicket，请先完成 MCP 应用授权。
            </VAlert>
            <VBtn
              class="mt-2"
              color="warning"
              style="color: rgb(var(--v-theme-on-warning))"
              :loading="isOpeningOauth"
              @click="openOauthAuthorizeWindow"
            >
              去授权
            </VBtn>
          </template>
        </VCol>
      </VRow>

      <template v-if="apiTicket">
        <VRow>
          <VCol cols="12">
            <div class="text-subtitle-1 mb-2">
              ApiTicket
            </div>
            <div>
              <VTextField
                :model-value="apiTicket"
                readonly
                density="comfortable"
                variant="outlined"
                hide-details
                class="ticket-input"
              />
              <VBtn
                color="primary"
                variant="tonal"
                :loading="isOpeningOauth"
                class="mt-2"
                @click="handleApiTicketAction"
              >
                {{ apiTicketActionText }}
              </VBtn>
            </div>
          </VCol>
        </VRow>

        <VRow class="mt-8">
          <div class="text-h3">
            Agent MCP 接入案例说明
          </div>
          <VCol cols="12">
            <VExpansionPanels>
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
      </template>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { type IdType } from 'sfc-common/model'
import { computed, ref, watch } from 'vue'
import { McpOauthApi } from '../../api'
import { waitOAuthCallback } from '../../core/waitOAuthCallback'
const SfcUtils = window.SfcUtils
const MarkdownView = window.Components.MarkdownView

/**
 * McpConfig 组件属性。
 */
interface McpConfigProps {
  /**
   * 当前查看配置的用户ID。
   * 该值用于感知用户上下文切换，并在切换后重新拉取当前上下文对应的 ApiTicket。
   */
  uid: IdType
}

const props = defineProps<McpConfigProps>()

/**
 * Claude Code 需要接入的 MCP 服务路径。
 */
const mcpServerPath = '/api/mcp/stream'

/**
 * Claude Code 实际需要配置的 MCP 服务完整地址。
 */
const mcpServerUrl = computed(() => new URL(mcpServerPath, location.origin).toString())

/**
 * 当前用户已有的 MCP ApiTicket。
 */
const apiTicket = ref<string | null>(null)

/**
 * 当前展示的 ApiTicket 是否为历史上已生成过的遮掩票据。
 * 为 true 时，表示用户只能重新生成，不能直接复制使用。
 */
const isHistoricalApiTicket = ref(false)

/**
 * 当前是否正在查询 ApiTicket。
 */
const isLoading = ref(false)

/**
 * 当前是否正在打开 OAuth 授权窗口。
 */
const isOpeningOauth = ref(false)

/**
 * ApiTicket 查询失败时展示的错误信息。
 */
const errorMessage = ref('')

/**
 * MCP 授权时需要申请的 OAuth 范围。
 */
const oauthScope = 'profile storage_read storage_write'

/**
 * MCP OAuth 回调路径。
 * 开发环境不添加 /api 前缀，正式打包环境添加 /api 前缀。
 */
const oauthCallbackPath = import.meta.env.DEV ? '/mcpOAuthCallback' : '/api/mcpOAuthCallback'

/**
 * 将未知错误对象转换为可展示的文本。
 * @param error 接口请求抛出的错误对象
 * @returns 适合直接展示给用户的错误信息
 */
function getErrorMessage(error: unknown): string {
  if (typeof error === 'string' && error.length > 0) {
    return error
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return '查询 MCP ApiTicket 失败'
}

/**
 * 根据 OAuth 应用ID组装授权页面地址。
 * @param appId MCP OAuth应用ID
 * @returns 当前站点下的 OAuth 授权页面绝对地址
 */
function buildOauthAuthorizeUrl(appId: string): string {
  const authorizeUrl = new URL('/oauth', location.origin)
  authorizeUrl.searchParams.set('appId', appId)
  authorizeUrl.searchParams.set('scope', oauthScope)
  authorizeUrl.searchParams.set('redirectUrl', location.origin + oauthCallbackPath)
  return authorizeUrl.toString()
}

/**
 * 组装 Claude Code 的 MCP 配置说明文档。
 * @param ticket 当前可用的 ApiTicket
 * @param serverUrl Claude Code 需要连接的 MCP 服务完整地址
 * @returns 用于 MarkdownView 渲染的 markdown 内容
 */
function buildConfigGuide(ticket: string, serverUrl: string): string {
  const authorizationHeader = `ApiTicket ${ticket}`
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
    `- 需要添加 OAuth Header：\`authorization: ${authorizationHeader}\``,
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
  if (!apiTicket.value) {
    return ''
  }
  return buildConfigGuide(apiTicket.value, mcpServerUrl.value)
})

/**
 * 当前 ApiTicket 操作按钮的显示文本。
 */
const apiTicketActionText = computed(() => isHistoricalApiTicket.value ? '重新生成' : '复制')

/**
 * 查询当前登录态下已有的 MCP ApiTicket。
 * 接口按当前登录态返回数据，因此这里用 uid 作为重新加载触发条件。
 */
async function loadApiTicket(): Promise<void> {
  isLoading.value = true
  errorMessage.value = ''
  apiTicket.value = null
  isHistoricalApiTicket.value = false

  try {
    // 仅展示当前用户已经持有的 ApiTicket，不在这里触发新的授权流程。
    const response = await SfcUtils.request(McpOauthApi.getExistingApiTicket())
    const existingApiTicket = response.data.data

    // 这里返回的是历史已生成过的票据展示值，因此需要标记为不可直接复制使用。
    apiTicket.value = existingApiTicket
    isHistoricalApiTicket.value = existingApiTicket !== null
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

/**
 * 将当前展示的 ApiTicket 复制到剪贴板，便于直接粘贴到 Claude Code 配置中。
 */
async function copyApiTicket(): Promise<void> {
  if (!apiTicket.value) {
    return
  }

  try {
    await SfcUtils.copyToClipboard(apiTicket.value)
    SfcUtils.snackbar('ApiTicket 已复制到剪贴板')
  } catch (error) {
    SfcUtils.snackbar(getErrorMessage(error))
  }
}

/**
 * 执行 MCP OAuth 授权流程，并在授权完成后更新为新的 ApiTicket 原文。
 */
async function startOauthAuthorizeFlow(): Promise<void> {
  // 先查询系统中为 MCP 配置的 OAuth 应用ID，再拼接当前站点的授权地址。
  const response = await SfcUtils.request(McpOauthApi.getAppId())
  const authorizeUrl = buildOauthAuthorizeUrl(response.data.data)

  // 提前挂起回调监听，确保授权页返回时能接收到新的 ApiTicket。
  void waitOAuthCallback().then((apiTicketValue) => {
    apiTicket.value = apiTicketValue
    isHistoricalApiTicket.value = false
    SfcUtils.alert('授权成功，请立即保存好 ApiTicket 票据原文，离开或刷新页面后只能重新生成新票据，无法再查看当前原文了。')
  }).catch((error) => {
    SfcUtils.alert(String(error))
  })

  // 使用独立小窗口打开授权页，避免用户离开当前配置页面。
  SfcUtils.openSmallWindow(authorizeUrl)
}

/**
 * 重新生成 MCP ApiTicket 前弹出确认，提示旧票据会立即失效。
 */
async function regenerateApiTicket(): Promise<void> {
  try {
    // 重新生成后旧票据立即失效，因此在继续前要求用户明确确认。
    await SfcUtils.confirm('重新生成后，旧 ApiTicket 将立即失效，确认继续吗？', '提示', {
      cancelToReject: true,
      confirmBtnText: '确认重新生成',
      cancelBtnText: '取消'
    })
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    throw error
  }

  await openOauthAuthorizeWindow()
}

/**
 * 根据当前 ApiTicket 状态执行对应动作。
 * 历史遮掩票据只能重新生成；新票据原文才允许复制。
 */
async function handleApiTicketAction(): Promise<void> {
  if (isHistoricalApiTicket.value) {
    await regenerateApiTicket()
    return
  }

  await copyApiTicket()
}

/**
 * 打开 MCP OAuth 授权窗口，引导当前用户完成授权。
 */
async function openOauthAuthorizeWindow(): Promise<void> {
  if (isOpeningOauth.value) {
    return
  }

  isOpeningOauth.value = true

  try {
    await startOauthAuthorizeFlow()
  } catch (error) {
    SfcUtils.snackbar(getErrorMessage(error))
  } finally {
    isOpeningOauth.value = false
  }
}

/**
 * 监听当前配置用户变化，并在用户上下文切换时重新拉取 ApiTicket。
 */
watch(
  () => props.uid,
  () => {
    void loadApiTicket()
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

.ticket-input {
  flex: 1 1 auto;
}

.markdown-wrapper :deep(.markdown-view) {
  height: 100%;
  padding: 16px;
  overflow: auto;
}
</style>