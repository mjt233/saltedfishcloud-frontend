<template>
  <FileExplorer
    v-model:path="currentPath"
    v-model:file-view-type="fileViewType"
    :file-system-handler="archiveFileSystemHandler"
    :read-only="true"
    :hide-tool-bar="true"
    :auto-open-file="false"
    :enable-menu="['refresh']"
  />
</template>

<script setup lang="ts">
import FileExplorer from 'sfc-common/components/common/FileExplorer/FileExplorer.vue'
import { FileSystemHandler } from 'sfc-common/core/serivce/FileSystemHandler'
import { ArchiveResource, FileInfo, FileType } from 'sfc-common/model'

interface ArchiveResourceViewerProps {
  /**
   * 压缩包内的资源列表
   */
  archiveResourceList: ArchiveResource[]
}

const props = defineProps<ArchiveResourceViewerProps>()

/**
 * 当前浏览路径，根路径固定为/
 */
const currentPath = ref('/')
const fileViewType = ref<FileViewType>('table')

/**
 * 将路径统一转换为“无首尾斜杠”的内部格式
 * @param path 原始路径
 * @returns 标准化路径
 */
function normalizePathKey(path: string) {
  return (path || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
}

/**
 * 获取路径的父级路径
 * @param pathKey 路径键（无首尾斜杠）
 * @returns 父级路径键
 */
function getParentPathKey(pathKey: string) {
  const idx = pathKey.lastIndexOf('/')
  return idx === -1 ? '' : pathKey.substring(0, idx)
}

/**
 * 把资源对象上的 archivePath 规范化为可解析的路径字符串
 * @param resource 压缩包资源
 * @returns 标准化后的压缩包内路径
 */
function resolveArchiveResourcePath(resource: ArchiveResource) {
  const path = (resource.archivePath || resource.name || '').replace(/\\/g, '/').replace(/^\/+/, '')
  if (!path) {
    return ''
  }
  if (resource.isDirectory && !path.endsWith('/')) {
    return `${path}/`
  }
  return path
}

/**
 * 将任意时间值转换为字符串，供文件列表展示使用
 * @param value 时间值
 * @returns 格式化字符串
 */
function toDateString(value?: Date) {
  if (!value) {
    return ''
  }
  return new Date(value).toISOString()
}

/**
 * 创建目录类型文件节点
 * @param dirPathKey 目录路径键（无首尾斜杠）
 * @returns 文件节点
 */
function createDirectoryNode(dirPathKey: string): FileInfo {
  const name = dirPathKey.split('/').pop() || '/'
  const parentPathKey = getParentPathKey(dirPathKey)
  return {
    id: dirPathKey || 'root',
    uid: 0,
    updateAt: '',
    createAt: '',
    md5: '',
    node: dirPathKey,
    name,
    size: 0,
    dir: true,
    type: 1 as FileType,
    suffix: '',
    mountId: '',
    ctime: '',
    mtime: '',
    isMount: false,
    path: parentPathKey ? `/${parentPathKey}` : '/'
  }
}

/**
 * 把压缩包资源映射为文件列表可识别的节点
 * @param pathKey 节点路径键（无首尾斜杠）
 * @param resource 资源对象
 * @param isDir 是否目录
 * @returns 文件节点
 */
function createNodeFromArchiveResource(pathKey: string, resource: ArchiveResource, isDir: boolean): FileInfo {
  const name = pathKey.split('/').pop() || resource.name
  const parentPathKey = getParentPathKey(pathKey)
  const suffix = isDir ? '' : ((name.includes('.') ? name.split('.').pop() : '') || '').toLowerCase()
  return {
    id: pathKey,
    uid: 0,
    updateAt: '',
    createAt: '',
    md5: '',
    node: pathKey,
    name,
    size: resource.size || 0,
    dir: isDir,
    type: (isDir ? 1 : 2) as FileType,
    suffix,
    mountId: '',
    ctime: toDateString(resource.created),
    mtime: toDateString(resource.lastModified),
    isMount: false,
    path: parentPathKey ? `/${parentPathKey}` : '/'
  }
}

/**
 * 构建虚拟文件树，按“父路径 => 子项列表”组织
 * @param archiveResourceList 压缩包资源列表
 * @returns 目录索引
 */
function buildArchiveTree(archiveResourceList: ArchiveResource[]) {
  const nodeMap = new Map<string, FileInfo>()
  const parentMap = new Map<string, FileInfo[]>()

  /**
   * 确保目录节点存在
   * @param dirPathKey 目录路径键
   */
  const ensureDirectory = (dirPathKey: string) => {
    if (!dirPathKey || nodeMap.has(dirPathKey)) {
      return
    }
    nodeMap.set(dirPathKey, createDirectoryNode(dirPathKey))
  }

  archiveResourceList.forEach(resource => {
    const resolvedPath = resolveArchiveResourcePath(resource)
    if (!resolvedPath) {
      return
    }

    const isDir = resource.isDirectory || resolvedPath.endsWith('/')
    const pathKey = normalizePathKey(isDir ? resolvedPath.replace(/\/+$/g, '') : resolvedPath)
    if (!pathKey) {
      return
    }

    const segments = pathKey.split('/').filter(Boolean)
    for (let i = 0; i < segments.length - 1; i++) {
      ensureDirectory(segments.slice(0, i + 1).join('/'))
    }

    nodeMap.set(pathKey, createNodeFromArchiveResource(pathKey, resource, isDir))
  })

  nodeMap.forEach((node, pathKey) => {
    const parentKey = getParentPathKey(pathKey)
    if (!parentMap.has(parentKey)) {
      parentMap.set(parentKey, [])
    }
    parentMap.get(parentKey)?.push(node)
  })

  parentMap.forEach(children => {
    children.sort((a, b) => {
      if (a.dir !== b.dir) {
        return a.dir ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })
  })

  return parentMap
}

class ArchiveReadonlyFileSystemHandler implements FileSystemHandler {
  /**
   * 获取最新压缩包资源列表的函数
   */
  private readonly getArchiveResourceList: () => ArchiveResource[]

  /**
   * 构造只读文件系统处理器
   * @param getArchiveResourceList 获取压缩包资源列表的方法
   */
  constructor(getArchiveResourceList: () => ArchiveResource[]) {
    this.getArchiveResourceList = getArchiveResourceList
  }

  getFileUrl(): string {
    return ''
  }

  getCustomThumbnailUrl(): string | undefined {
    return undefined
  }

  async loadList(path: string): Promise<FileInfo[]> {
    const tree = buildArchiveTree(this.getArchiveResourceList())
    const pathKey = normalizePathKey(path)
    return (tree.get(pathKey) || []).map(item => ({ ...item }))
  }

  async mkdir(): Promise<null> {
    throw new Error('压缩包查看模式为只读，不支持创建目录')
  }

  async deleteFile(): Promise<number> {
    throw new Error('压缩包查看模式为只读，不支持删除文件')
  }

  async uploadDirect(): Promise<any> {
    throw new Error('压缩包查看模式为只读，不支持上传文件')
  }

  async rename(): Promise<string> {
    throw new Error('压缩包查看模式为只读，不支持重命名')
  }
}

/**
 * 压缩包只读文件系统处理器实例
 */
const archiveFileSystemHandler = new ArchiveReadonlyFileSystemHandler(() => props.archiveResourceList || [])
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, ref } from 'vue'
import { FileViewType } from '../FileExplorer/FileExplorerCore'

export default defineComponent({
  name: 'ArchiveResourceViewer'
})
</script>