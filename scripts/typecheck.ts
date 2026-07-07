import { spawn } from 'child_process'
import { resolve, dirname, relative } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, existsSync } from 'fs'
import { readdirSync } from 'fs'
import { externalLibPath } from '../build/extension/external-lib-paths.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')

// ─── sfc-common 导入规范检查 ────────────────────────────────────────────

/** 需要扫描的文件后缀 */
const SCAN_EXT = new Set(['.ts', '.d.ts', '.vue'])

/** 排除的目录名 */
const EXCLUDE_DIRS = new Set(['dist', 'node_modules'])

/** 扩展目录路径 */
const EXT_DIR = resolve(ROOT, 'sfc-ext')

/** 是否发现导入规范错误 */
let hasImportError = false

/**
 * 递归遍历目录下所有指定后缀的文件
 */
function* walkFiles(dir: string): Generator<string> {
  if (!existsSync(dir)) return
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (EXCLUDE_DIRS.has(entry.name)) continue
    const fullPath = resolve(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walkFiles(fullPath)
    } else if (entry.isFile()) {
      const dotIdx = entry.name.lastIndexOf('.')
      const ext = dotIdx >= 0 ? entry.name.slice(dotIdx) : ''
      if (SCAN_EXT.has(ext)) {
        yield fullPath
      }
    }
  }
}

/**
 * 判断一行 import 语句是否为纯类型导入（应跳过检查）
 * - import type { ... } from ...
 * - import type X from ...
 * - import { type X, type Y } from ...   （所有具名导入都是 type）
 */
function isPureTypeImport(line: string): boolean {
  const trimmed = line.trim()

  // import type ... from ...
  if (/^import\s+type\s/.test(trimmed)) return true

  // 解析 { ... } 中的 specifiers，判断是否全部带 type 关键字
  const braceMatch = trimmed.match(/\{([^}]*)\}\s*from/)
  if (braceMatch) {
    const specifiers = braceMatch[1].split(',').map(s => s.trim()).filter(Boolean)
    // 只有存在至少一个 specifier，且全部以 'type ' 开头时才算纯类型导入
    return specifiers.length > 0 && specifiers.every(s => /^type\s/.test(s))
  }

  // 默认导入或命名空间导入 (import X from / import * as X from) 均非纯类型
  return false
}

/**
 * 检查单个文件中的 import 语句是否符合 sfc-common 导入规范
 */
function checkFile(filePath: string): void {
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const relPath = relative(ROOT, filePath).replace(/\\/g, '/')

  let inImport = false
  let importLineNum = 0
  let importLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1
    const line = lines[i]

    if (!inImport) {
      // 检测 import 语句开始
      if (/^import\s/.test(line.trim())) {
        inImport = true
        importLineNum = lineNum
        importLines = [line]

        // 单行 import 包含 from 子句，直接处理
        if (/from\s+['"][^'"]*['"]/.test(line)) {
          processImportLine(relPath, importLineNum, line)
          inImport = false
          importLines = []
        }
      }
    } else {
      importLines.push(line)
      // 在多行 import 中找到 from 子句
      if (/from\s+['"][^'"]*['"]/.test(line)) {
        const combined = importLines.join(' ')
        processImportLine(relPath, importLineNum, combined)
        inImport = false
        importLines = []
      }
    }
  }
}

/**
 * 处理一行（可能是合并后的）import 语句，检查 sfc-common 导入路径是否合规
 */
function processImportLine(relPath: string, lineNum: number, line: string): void {
  // 纯类型导入跳过检查
  if (isPureTypeImport(line)) return
  if (!line.includes('sfc-common/components')) return


  // 提取模块路径
  const match = line.match(/from\s+['"]([^'"]+)['"]/)
  if (!match) return

  const specifier = match[1]

  // 只检查 sfc-common 路径
  if (specifier !== 'sfc-common' && !specifier.startsWith('sfc-common/')) return

  // 检查是否在 externalLibPath 白名单中
  if (!externalLibPath.includes(specifier)) {
    console.error(`${relPath}:${lineNum} - error : 插件模块对sfc-common模块组件的导入不规范`)
    hasImportError = true
  }
}

// ─── 执行检查 ───────────────────────────────────────────────────────────

for (const filePath of walkFiles(EXT_DIR)) {
  checkFile(filePath)
}

// ─── 运行 TypeScript 类型检查 ──────────────────────────────────────────

const vueTsc = spawn('npx vue-tsc --noEmit', {
  env: { ...process.env },
  stdio: 'inherit',
  shell: true,
  cwd: ROOT,
})

vueTsc.on('exit', (code) => {
  // 导入规范检查失败也视为错误
  process.exit(code !== 0 ? code : hasImportError ? 1 : 0)
})