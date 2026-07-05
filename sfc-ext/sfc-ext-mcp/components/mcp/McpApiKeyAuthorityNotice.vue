<template>
  <div class="pa-2">
    <div class="text-subtitle-1 font-weight-medium mb-3">
      请确认 MCP API Key 权限风险
    </div>
    <div class="text-body-2 mb-2">
      继续生成后，持有该 Key 的第三方 MCP 客户端将拥有以下文件操作能力：
    </div>
    <VAlert type="info" variant="tonal" class="mt-4 mb-4">
      请仅在受信任客户端中使用此 Key，泄露将导致文件数据被读取或修改。
    </VAlert>
    <VSheet rounded elevation="1" class="pa-1">
      <VList density="comfortable">
        <AuthorityListItem
          v-for="item in authorityList"
          :key="item.code"
          :item="item"
        />
      </VList>
    </VSheet>
  </div>
</template>

<script setup lang="ts">
/**
 * MCP API Key 授权能力说明项。
 */
const authorityList: AuthorityItem[] = [
  {
    code: 'mcp_file_read',
    name: '读取文件',
    describe: '允许第三方 MCP 客户端读取你的文件与目录信息。',
    icon: 'mdi-file-eye'
  },
  {
    code: 'mcp_file_write',
    name: '写入文件',
    describe: '允许第三方 MCP 客户端创建、修改、删除文件。',
    icon: 'mdi-file-edit',
    isDanger: true
  }
]
</script>

<script lang="ts">
import { defineComponent } from 'vue'
import AuthorityListItem from '../../../../sfc-oauth/components/AuthorityListItem.vue'
import { type AuthorityItem } from '../../../../sfc-oauth/model'

export default defineComponent({
  name: 'McpApiKeyAuthorityNotice'
})
</script>

