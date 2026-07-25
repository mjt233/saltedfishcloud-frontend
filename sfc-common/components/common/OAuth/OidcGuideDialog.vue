<template>
  <div>
    <VProgressLinear v-if="loading" indeterminate color="primary" />
    <VAlert v-else-if="error" type="error" class="ma-4">
      {{ error }}
    </VAlert>
    <template v-else>
      <VTabs
        v-model="activeTab"
        color="primary"
        grow
      >
        <VTab value="standard">
          标准 OIDC
        </VTab>
        <VTab value="device">
          设备授权
        </VTab>
      </VTabs>
      <VWindow v-model="activeTab">
        <VWindowItem value="standard">
          <MarkdownView :content="standardMd" />
        </VWindowItem>
        <VWindowItem value="device">
          <MarkdownView :content="deviceMd" />
        </VWindowItem>
      </VWindow>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { MarkdownView } from '../Markdown'

/**
 * 当前激活的页签
 */
const activeTab = ref('standard')
/** 是否加载中 */
const loading = ref(true)
/** 错误信息 */
const error = ref('')
/** OIDC 配置数据 */
const oidcConfig = ref<Record<string, any>>({})

const oidcDiscoveryEndpoint = `${window.location.origin}/.well-known/openid-configuration`

/**
 * 从 /.well-known/openid-configuration 获取 OIDC 端点配置
 */
async function fetchOidcConfig() {
  loading.value = true
  error.value = ''
  try {
    const res = await SfcUtils.request<Record<string, any>>({
      url: oidcDiscoveryEndpoint
    })
    oidcConfig.value = res.data
  } catch (err: any) {
    error.value = '获取 OIDC 配置失败：' + (err?.message || String(err))
  } finally {
    loading.value = false
  }
}

/**
 * 辅助函数：取数组值并构造为列表
 */
function joinArrToList(arr: string[] | undefined): string {
  return arr?.length ? '\n- ' + arr.join('\n- ') : '（无）'
}

/**
 * 辅助函数：取数组值并用顿号连接
 */
function joinArr(arr: string[] | undefined): string {
  return arr?.length ? arr.join('、') : '（无）'
}

/**
 * 辅助函数：取字符串值或回退文本
 */
function strVal(val: string | undefined, fallback = '（未提供）'): string {
  return val || fallback
}

/**
 * 辅助函数：构造端点表格行
 */
function endpointRow(label: string, value: string | undefined): string {
  return `| ${label} | \`${strVal(value)}\` |`
}

/**
 * 标准 OIDC 接入说明 markdown
 */
const standardMd = computed(() => {
  const c = oidcConfig.value
  if (!c || !c.issuer) {
    return '暂无配置数据'
  }

  return `## 标准 OIDC 接入说明

以下是在支持 OIDC 协议的第三方系统中需要配置的端点信息。

### 服务基本信息

| 配置项 | 值 |
|--------|-----|
${endpointRow('Issuer（签发者标识）', c.issuer)}
${endpointRow('Discovery URL（OIDC 自动发现端点）', oidcDiscoveryEndpoint)}

### 认证与令牌端点

| 端点 | URL |
|------|-----|
${endpointRow('授权端点（Authorization Endpoint）', c.authorization_endpoint)}
${endpointRow('令牌端点（Token Endpoint）', c.token_endpoint)}
${endpointRow('用户信息端点（UserInfo Endpoint）', c.userinfo_endpoint)}
${endpointRow('退出登录端点（End Session Endpoint）', c.end_session_endpoint)}
${endpointRow('JWKS 公钥端点', c.jwks_uri)}
${endpointRow('令牌撤销端点（Revocation Endpoint）', c.revocation_endpoint)}
${endpointRow('令牌内省端点（Introspection Endpoint）', c.introspection_endpoint)}

### 支持的授权类型（Grant Types）

${joinArrToList(c.grant_types_supported)}

### 支持的 Scope

${joinArrToList(c.scopes_supported)}

### 支持的客户端认证方式

${joinArrToList(c.token_endpoint_auth_methods_supported)}

### 其他配置

| 配置项 | 支持的值 |
|--------|---------|
| 授权响应类型 | \`${joinArr(c.response_types_supported)}\` |
| PKCE 质询方法 | \`${joinArr(c.code_challenge_methods_supported)}\` |
| ID Token 签名算法 | \`${joinArr(c.id_token_signing_alg_values_supported)}\` |
| Subject 类型 | \`${joinArr(c.subject_types_supported)}\` |

### 配置示例

在第三方系统中配置 OIDC 时的常见填写方式：

- **Client ID**：在「OAuth 应用管理」中创建应用后获取的 \`App ID\`
- **Client Secret**：创建应用后生成的密钥（机密应用需要）
- **Authorization URL**：\`${strVal(c.authorization_endpoint)}\`
- **Token URL**：\`${strVal(c.token_endpoint)}\`
- **UserInfo URL**：\`${strVal(c.userinfo_endpoint)}\`
- **Logout URL**：\`${strVal(c.end_session_endpoint)}\`
- **JWKS URL**：\`${strVal(c.jwks_uri)}\`
- **Scope**：\`openid profile\`
- **Response Type**：\`code\`
- **Grant Type**：\`authorization_code\``
})

/**
 * 设备授权流程接入说明 markdown
 */
const deviceMd = computed(() => {
  const c = oidcConfig.value
  if (!c || !c.issuer) {
    return '暂无配置数据'
  }

  const deviceEndpoint = c.device_authorization_endpoint
  if (!deviceEndpoint) {
    return '> 该服务未启用设备授权流程（device_authorization_endpoint 未配置）。'
  }

  return `## 设备授权流程接入说明

设备授权流程（Device Authorization Grant）适用于无浏览器或输入受限的设备（如电视、命令行工具等）。

### 端点信息

| 端点 | URL |
|------|-----|
${endpointRow('设备授权端点（Device Authorization Endpoint）', deviceEndpoint)}
${endpointRow('令牌端点（Token Endpoint）', c.token_endpoint)}

### 流程概述

1. 客户端向 **设备授权端点** 发起 \`POST\` 请求，获取 \`device_code\`、\`user_code\` 和 \`verification_uri\`。
2. 用户在浏览器中访问 \`${strVal(c.issuer)}\` 提供的验证页面并输入 \`user_code\` 完成用户授权。
3. 客户端使用 \`device_code\` 配合 \`grant_type=urn:ietf:params:oauth:grant-type:device_code\` **轮询令牌端点**获取访问令牌。

### 授权类型

\`urn:ietf:params:oauth:grant-type:device_code\``
})

onMounted(fetchOidcConfig)
</script>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'OidcGuideDialog'
})
</script>
