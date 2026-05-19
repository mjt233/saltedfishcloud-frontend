import { MenuHelper } from 'sfc-common'
import { h } from 'vue'
import McpConfig from './components/mcp/McpConfig.vue'

export {}

window.bootContext.addProcessor({
  taskName: '注册MCP功能配置',
  execute(app, handler) {
    MenuHelper.addMoreBoxMenu({
      id: 'mcp-config',
      title: 'MCP 配置',
      action(ctx) {
        ctx.title = 'MCP 配置'
        ctx.currentComponent = h(McpConfig, {
          uid: window.getContext().session.value.user.id
        })
      },
    })
  }
})