<template>
  <div class="pa-4 d-flex justify-center">
    <v-btn
      color="primary"
      variant="tonal"
      prepend-icon="mdi-folder-zip-outline"
      size="large"
      @click="openArchiveViewer"
    >
      预览压缩包
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import API from 'sfc-common/api'
import { getContext } from 'sfc-common'
import type { ArchiveEngine, ArchiveResource } from 'sfc-common/model'
import ArchiveResourceViewer from 'sfc-common/components/common/Archive/ArchiveResourceViewer.vue'
import type { InvalidDataRecord, FileTypeCheckResult } from '../../model'

const SfcUtils = window.SfcUtils

/** 组件属性 */
const props = defineProps({
  /**
   * 要预览的失效数据记录
   */
  item: {
    type: Object as PropType<InvalidDataRecord>,
    required: true
  },
  /**
   * 抽屉是否可见，用于在抽屉关闭时暂停或释放预览的资源
   */
  drawerVisible: {
    type: Boolean,
    default: true
  }
})

/**
 * 从失效数据记录中提取文件扩展名
 * 优先从 typeCheckResult 中获取识别出的扩展名，其次从路径中提取
 * @returns 提取到的扩展名（不含点号）和用于展示的文件名
 */
function extractFileInfo(): { extension: string; displayName: string } {
  // 1. 尝试从类型检测结果中提取识别出的扩展名
  if (props.item.typeCheckResult) {
    try {
      const typeResult = JSON.parse(props.item.typeCheckResult) as FileTypeCheckResult | undefined
      const ext = typeResult?.detail?.extension || ''
      if (ext) {
        // 去掉可能的前导点号，统一为无点号的扩展名
        const cleanExt = ext.startsWith('.') ? ext.substring(1) : ext
        // 从路径中提取展示用文件名
        const path = props.item.diskPath || props.item.storagePath || ''
        const segments = path.replace(/\\/g, '/').split('/')
        const rawName = segments[segments.length - 1] || `ID: ${props.item.id}`
        return { extension: cleanExt, displayName: rawName }
      }
    } catch {
      // 解析失败时继续尝试从路径提取
    }
  }

  // 2. 回退：从存储路径或磁盘路径中提取文件名和扩展名
  const path = props.item.diskPath || props.item.storagePath || ''
  if (!path) {
    return { extension: '', displayName: `ID: ${props.item.id}` }
  }
  const segments = path.replace(/\\/g, '/').split('/')
  const name = segments[segments.length - 1] || ''
  const idx = name.lastIndexOf('.')
  const extension = idx > 0 ? name.substring(idx + 1) : ''
  return { extension, displayName: name }
}

/**
 * 根据扩展名和压缩引擎列表选择用于查看压缩包的格式与引擎
 * @param extension 文件扩展名（不含点号，如 zip、7z、rar）
 * @param archiveEngineList 可用压缩引擎列表
 * @returns 匹配结果，包含格式名和对应的引擎
 */
function resolveArchiveViewerOption(extension: string, archiveEngineList: ArchiveEngine[]) {
  if (!extension) {
    return {
      format: '',
      engine: undefined as ArchiveEngine | undefined
    }
  }

  const lowerExt = extension.toLowerCase()
  const formatWithDot = `.${lowerExt}`

  // 查找支持该扩展名的引擎
  const engine = archiveEngineList.find(
    item => item.decompressExtensions?.some(ext => ext.toLowerCase() === formatWithDot.toLowerCase())
  )

  return {
    format: lowerExt,
    engine
  }
}

/**
 * 点击"预览压缩包"按钮，解析压缩包引擎并打开压缩包资源浏览对话框
 */
async function openArchiveViewer() {
  // 1. 提取文件扩展名和展示名称
  const { extension, displayName } = extractFileInfo()
  // 2. 获取可用压缩引擎列表
  const archiveEngineList = getContext().feature.value.archiveEngineList
  // 3. 根据扩展名解析匹配的压缩格式和引擎
  const { format, engine } = resolveArchiveViewerOption(extension, archiveEngineList)

  if (!format || !engine) {
    SfcUtils.snackbar('未找到可用的解压引擎，无法查看压缩包内容')
    return
  }

  // 4. 请求压缩包内资源列表
  let archiveResourceList: ArchiveResource[] = []
  try {
    archiveResourceList = await SfcUtils.loadingDialogTask(
      { msg: '正在读取压缩包内容...' },
      async() => {
        return (
          await SfcUtils.request(
            API.archive.listResources({
              engineProviderId: engine.engineId,
              engineProperty: {
                extension: `.${format}`
              },
              resourceRequest: {
                protocol: 'invalid-data',
                targetId: props.item.id,
                path: '',
                name: ''
              }
            })
          )
        ).data.data as ArchiveResource[]
      }
    )
  } catch (err) {
    SfcUtils.alert(err + '', '预览失败')
    return
  }

  // 5. 打开压缩包资源浏览对话框
  SfcUtils.openComponentDialog(ArchiveResourceViewer, {
    title: `查看压缩包 - ${displayName}`,
    props: {
      archiveResourceList
    },
    extraDialogOptions: {
      maxWidth: '1200px',
      confirmText: '关闭',
      cancelText: ''
    }
  })
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ArchivePreviewer'
})
</script>
