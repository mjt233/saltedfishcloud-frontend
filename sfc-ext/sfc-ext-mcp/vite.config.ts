import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'
  return {
    base: isDev ? 'mcpOAuthCallback' : 'api/mcpOAuthCallback',
    build: {
      outDir: 'dist/mcpOAuthCallback',
    },
    plugins: [
      vue(),
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
        '/api': {
          target: 'http://127.0.0.1:8087',
          changeOrigin: true,
          ws: true
        }
      }
    }
  }
})