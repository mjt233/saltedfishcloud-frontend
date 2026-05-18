# 咸鱼云 MCP 插件

## 开发指南

### 启动 OAuth 前端服务

MCP 服务复用了 OAuth 授权模式，本地开发调试时需要开启 OAuth 的开发模式

在前端的`sfc-oauth`模块目录下执行

```shell
npx vite --port=4001
```

### 启动 MCP 前端回调服务

用于在 OAuth 授权完成后将授权信息通知给发起页面

在`sfc-ext-mcp`模块目录下执行

```shell
npx vite --port=4002
```