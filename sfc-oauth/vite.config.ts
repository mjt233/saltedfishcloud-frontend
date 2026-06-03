import { defineConfig, UserConfigExport } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import type { ProxyOptions, ServerOptions } from 'vite'

const DEV_SERVER_PORT = 4001
const BACKEND_TARGET = 'http://127.0.0.1:8087'

/**
 * 创建统一的代理配置，自动添加 X-Forwarded-* 头
 */
function createProxy(opts: Record<string, any> = {}): ProxyOptions {
  return {
    target: BACKEND_TARGET,
    changeOrigin: true,
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq, req) => {
        proxyReq.setHeader('X-Forwarded-Host', req.headers.host || `localhost:${DEV_SERVER_PORT}`)
        proxyReq.setHeader('X-Forwarded-Port', String(DEV_SERVER_PORT))
        proxyReq.setHeader('X-Forwarded-Proto', 'http')
      })
    },
    ...opts
  }
}

export default defineConfig({
  base: '/oauth',
  build: {
    outDir: '../dist/oauth'
  },
  plugins: [
    vue(),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
      autoImport: true,
    }),
    // Components({
    //   dirs: 'sfc-common/components',
    //   dts: 'sfc-common/components.d.ts'
    // })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  },
  server: {
    proxy: {
      '/api': createProxy({ ws: true }),
      '/oauth2': createProxy()
    }
  }
})