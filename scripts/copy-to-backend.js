/**
 * 将 dist/ 目录复制到后端项目的 webapp 目录
 * 
 * 环境变量：
 *   BACKEND_PATH - 后端项目根目录路径
 * 
 * 复制目标：${BACKEND_PATH}/sfc-core/target/classes/webapp
 */

import fs from 'fs'
import path from 'path'

const SOURCE_DIR = 'dist'
const TARGET_SUB_PATH = 'sfc-core/target/classes/webapp'

/**
 * 递归复制目录
 * @param {string} src - 源目录路径
 * @param {string} dest - 目标目录路径
 */
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      console.log(`复制文件到: ${destPath}`)
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

// 主逻辑
const backendPath = process.env.BACKEND_PATH

if (!backendPath) {
  console.error('错误：BACKEND_PATH 环境变量未设置')
  console.error('请在 .env 文件中配置，例如：BACKEND_PATH=C:\\path\\to\\backend')
  process.exit(1)
}

const source = path.resolve(SOURCE_DIR)
const dest = path.join(backendPath, TARGET_SUB_PATH)

if (!fs.existsSync(source)) {
  console.error(`错误：源目录 ${source} 不存在，请先执行 build`)
  process.exit(1)
}
console.log('===============================================================================')
console.log('注意: 该脚本仅用于开发时临时将前端构建产物复制到后端的编译目录，执行mvn clean会被清理')
console.log('===============================================================================')
console.log(`复制 ${source} -> ${dest}`)
copyDir(source, dest)
console.log('复制完成')