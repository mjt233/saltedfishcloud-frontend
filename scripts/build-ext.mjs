import { spawn } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { argv } from 'process'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const VITE_CONFIG = 'build/extension/build.ts'

function usage() {
  console.error('用法: node scripts/build-ext.mjs <插件名|--all>')
  console.error('示例: node scripts/build-ext.mjs demo')
  console.error('      node scripts/build-ext.mjs --all')
  process.exit(1)
}

/**
 * 简易解析 .env 文件（仅 key=value，支持注释和空行）
 */
function readDotEnv(filePath) {
  if (!existsSync(filePath)) return {}
  const lines = readFileSync(filePath, 'utf-8').split(/\r?\n/)
  const env = {}
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim()
  }
  return env
}

/**
 * 构建单个插件
 */
function buildPlugin(name) {
  return new Promise((resolve) => {
    console.log(`\n========== 构建插件: ${name} ==========`)
    const child = spawn(`npx vite build --config ${VITE_CONFIG}`, {
      env: { ...process.env, VITE_EXT_NAME: name },
      stdio: 'inherit',
      shell: true,
      cwd: ROOT,
    })
    child.on('close', (code) => resolve(code ?? 0))
  })
}

const arg = argv[2]
if (!arg) usage()

if (arg === '--all') {
  const devEnv = readDotEnv(resolve(ROOT, '.env.development'))
  const plugins = (devEnv.VITE_PLUGINS || '').split(',').filter(Boolean)
  if (plugins.length === 0) {
    console.error('.env.development 中未找到 VITE_PLUGINS')
    process.exit(1)
  }
  let success = true
  for (const name of plugins) {
    const code = await buildPlugin(name)
    if (code !== 0) {
      console.error(`插件 ${name} 构建失败 (exit code: ${code})`)
      success = false
    }
  }
  process.exit(success ? 0 : 1)
} else {
  const code = await buildPlugin(arg)
  process.exit(code)
}
