import { Plugin } from 'vite'
import path from 'path'
import fs from 'fs'

/**
 * 获取后端仓库路径，优先系统环境变量，回退到 .env.development/.env 文件
 * @returns 后端仓库路径，未配置则返回 undefined
 */
function getBackendPath(): string | undefined {
  if (process.env.BACKEND_PATH) {
    return process.env.BACKEND_PATH
  }

  const envFiles = ['.env.development', '.env']
  for (const fileName of envFiles) {
    const filePath = path.resolve(__dirname, `../../${fileName}`)
    if (!fs.existsSync(filePath)) {
      continue
    }
    const content = fs.readFileSync(filePath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (trimmed.startsWith('BACKEND_PATH=')) {
        return trimmed.substring('BACKEND_PATH='.length).trim()
      }
    }
  }
  return undefined
}

/**
 * 递归复制目录
 * @param src 源目录路径
 * @param dest 目标目录路径
 */
function copyDirSync(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath)
    } else {
      console.log(`  复制文件: ${destPath}`)
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

/**
 * 创建将构建产物复制到后端仓库的 Vite 插件
 * @param extensionName 拓展名称
 * @returns Vite 插件实例
 */
export function copyToBackendPlugin(extensionName: string): Plugin {
  return {
    name: 'copy-to-backend',
    closeBundle() {
      const backendPath = getBackendPath()

      if (!backendPath) {
        console.log(`[copy-to-backend] BACKEND_PATH 未配置，跳过复制 ${extensionName}`)
        return
      }

      const sourceDir = path.resolve(`public/ext/${extensionName}`)
      const targetDir = path.join(backendPath, `sfc-ext/${extensionName}/src/main/assert/static`)

      if (!fs.existsSync(sourceDir)) {
        console.warn(`[copy-to-backend] 源目录不存在: ${sourceDir}`)
        return
      }

      console.log(`[copy-to-backend] 复制 ${extensionName} 构建产物到后端仓库:`)
      console.log(`  源: ${sourceDir}`)
      console.log(`  目标: ${targetDir}`)
      copyDirSync(sourceDir, targetDir)
      console.log(`[copy-to-backend] ${extensionName} 复制完成`)
    }
  }
}
