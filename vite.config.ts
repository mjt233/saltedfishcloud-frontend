import { defineConfig, UserConfigExport } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
// import Components from 'unplugin-vue-components/vite'

const path = require('path')

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
      // '/api': 'http://192.168.5.100:8087'
      '/api': 'http://127.0.0.1:8087'
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
