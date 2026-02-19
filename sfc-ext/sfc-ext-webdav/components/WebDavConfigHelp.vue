<template>
  <VCard>
    <VCardTitle>WebDav配置帮助</VCardTitle>
    <VCardText>
      <MarkdownView
        :content="content"
      />
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
// const props = defineProps({})
const content = `

1. 将监听地址配置为 \`127.0.0.1\` 确保原始的HTTP WebDAV服务只能在本地访问，防止被外网访问。
2. 配置WebDAV服务端口，如：8086
3. 参考以下nginx对WebDAV服务的反代配置案例

\`\`\`nginx
server {
  listen 344 ssl;
  server_name your_domain.com; # 替换为你的域名或 IP

  # --- 配置你的SSL证书 ---
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;

  # --- WebDAV 性能优化 ---
  # 禁用请求体缓冲：大文件上传时直接流式传输到后端，不占用本地磁盘 I/O
  proxy_request_buffering off;
  # 禁用响应缓冲：下载大文件时减少 Nginx 内存/磁盘占用
  proxy_buffering off;

  location / {
    proxy_pass http://127.0.0.1:8086;
    
    # 传递 WebDAV 必须的 Header
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # 允许较大的 WebDAV 文件上传
    client_max_body_size 0; 

    # 延长超时时间，防止大文件传输中断
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;

    # --- 针对 WebDAV 的特殊配置 ---
    # 确保 Nginx 不会拦截后端 WebDAV 的特殊方法 (PROPFIND, MKCOL 等)
    proxy_set_header Destination $http_destination;
  }
}
\`\`\`

> nginx配置完成后，此时WebDAV的访问地址即为： https://your_domain.com:344

4. 将访问地址填写到WebDav服务配置的\`展示的服务地址\`中即可
`
</script>

<script lang="ts">
import { MarkdownView } from 'sfc-common/components'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'WebDavConfigHelp',
  components: {
    MarkdownView: MarkdownView
  }
})
</script>