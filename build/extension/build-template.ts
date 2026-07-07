import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { copyToBackendPlugin } from '../plugins/copy-to-backend-plugin'

/**
 * 声明一个拓展，插件名称由环境变量 VITE_EXT_NAME 指定（例如 demo）
 */
export function defineExtension() {
  const shortName = process.env.VITE_EXT_NAME
  if (!shortName) {
    throw new Error('环境变量 VITE_EXT_NAME 未设置，请指定插件名称')
  }
  const extensionName = `sfc-ext-${shortName}`
  return defineConfig({
    base: `/ext/${extensionName}/`,
    publicDir: `/sfc-ext/${extensionName}/public`,
    plugins: [
      vue(),
      copyToBackendPlugin(extensionName),
      // vuetify({
      //   autoImport: true,
      // })
    ],
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    },
    define: { 'process.env': {} },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, `../../sfc-ext/${extensionName}/src`),
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
    build: {
      lib: {
        entry: path.resolve(__dirname, `../../sfc-ext/${extensionName}/main.ts`),
        name: extensionName,
        fileName: (format) => `index.${format}.js`,
        formats: ['umd']
      },
      rollupOptions: {
        // 确保外部化处理那些你不想打包进库的依赖
        external: [
          // 公共库
          'vue', 'dplayer', 'vuetify', 'vuetify/components', 'qs', 'monaco-editor',

          // 咸鱼云前端核心模块
          'sfc-common', 'sfc-common/components', 'sfc-common/utils/SfcUtils/index.js', 'sfc-common/utils/SfcUtils'
        ],
        output: {
          // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
          globals: {
            vue: 'Vue',
            dplayer: 'DPlayer',
            vuetify: 'Vuetify',
            'sfc-common': 'SfcCommon',
            qs: 'qs',
            'sfc-common/components': 'Components',
            'vuetify/components': 'VuetifyComponent',
            'sfc-common/utils/SfcUtils/index.js': 'SfcUtils',
            'sfc-common/utils/SfcUtils': 'SfcUtils'
          }
        }
      },
      outDir: `public/ext/${extensionName}`
    }
  })
}

