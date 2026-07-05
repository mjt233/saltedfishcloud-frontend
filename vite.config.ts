import { defineConfig, ProxyOptions, UserConfigExport } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
// import Components from 'unplugin-vue-components/vite'
import path from 'path' 

const DEV_SERVER_PORT = 4000
const BACKEND_TARGET = 'http://127.0.0.1:8087'

/**
 * 创建统一的代理配置，自动添加 X-Forwarded-* 头
 */
function createProxy(opts: Record<string, any> = {}): ProxyOptions {
  return {
    target: BACKEND_TARGET,
    changeOrigin: true,
    ws: true,
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

const env = {} as any
const commonConfig: UserConfigExport = {
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
  optimizeDeps: {
    include: [
      'monaco-editor/esm/vs/language/json/json.worker',
      'monaco-editor/esm/vs/language/css/css.worker',
      'monaco-editor/esm/vs/language/html/html.worker',
      'monaco-editor/esm/vs/language/typescript/ts.worker',
      'monaco-editor/esm/vs/editor/editor.worker'
    ]
  },
  define: { 'process.env': env },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
      '.d.ts'
    ]
  },
  server: {
    proxy: {
      '/api': createProxy(),
      '/oauth': createProxy(),
      '/.well-known/openid-configuration': createProxy()
    }
  },
}

// https://vitejs.dev/config/
export default defineConfig((configEnv) => {
  // if (configEnv.command == 'serve') {
  //   console.log('开发模式')
  // } else {
  //   console.log('非开发模式')
  // }
  console.log(import.meta.url)
  return commonConfig
})
