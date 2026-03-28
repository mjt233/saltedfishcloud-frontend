import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
/**
 * 拓展声明配置
 */
export interface ExtensionConfig {
  /**
   * 拓展名称
   */
  name: string
}

/**
 * 声明一个拓展
 * @param conf 拓展配置
 */
export function defineExtension(conf: ExtensionConfig) {
  const extensionName = conf.name
  return defineConfig({
    base: `/ext/${extensionName}/`,
    publicDir: `/sfc-ext/${extensionName}/public`,
    plugins: [
      vue(),
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
        external: ['vue', 'dplayer', 'vuetify', 'sfc-common', 'monaco-editor', 'qs', 'sfc-common/components'],
        output: {
          // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
          globals: {
            vue: 'Vue',
            dplayer: 'DPlayer',
            vuetify: 'Vuetify',
            'sfc-common': 'SfcCommon',
            qs: 'qs',
            'sfc-common/components': 'Components'
          }
        }
      },
      outDir: `public/ext/${extensionName}`
    }
  })
}

