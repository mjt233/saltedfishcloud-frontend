import API from 'sfc-common/api'
import ArchiveResourceViewer from 'sfc-common/components/common/Archive/ArchiveResourceViewer.vue'
import { getContext } from 'sfc-common/core/context'
import { ArchiveTaskService } from 'sfc-common/core/serivce/ArchiveTaskService'
import { ArchiveEngine, ArchiveResource } from 'sfc-common/model'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { FileOpenHandler } from '../type'

/**
 * 根据文件名和压缩引擎列表选择用于查看压缩包的格式与引擎
 * @param filename 压缩包文件名
 * @param archiveEngineList 可用压缩引擎列表
 * @returns 匹配结果
 */
function resolveArchiveViewerOption(filename: string, archiveEngineList: ArchiveEngine[]) {
  const formats = new Set<string>()
  archiveEngineList.forEach(engine => {
    engine.decompressExtensions?.forEach(ext => {
      const cleanExt = ext.startsWith('.') ? ext.substring(1) : ext
      formats.add(cleanExt.toLowerCase())
    })
  })

  const sortedFormats = Array.from(formats).sort((a, b) => b.length - a.length)
  if (sortedFormats.length === 0) {
    return {
      format: '',
      engine: undefined as ArchiveEngine | undefined
    }
  }

  const lowerFileName = filename.toLowerCase()
  const format = sortedFormats.find(ext => lowerFileName.endsWith('.' + ext)) || sortedFormats[0]
  const formatWithDot = `.${format}`
  const engine = archiveEngineList.find(item => item.decompressExtensions?.some(ext => ext.toLowerCase() === formatWithDot.toLowerCase()))

  return {
    format,
    engine
  }
}

/**
 * 判断当前文件是否支持“查看压缩包”打开方式
 * @param filename 文件名
 * @returns 是否可查看
 */
function canViewArchiveFile(filename: string) {
  const lowerName = filename.toLowerCase()
  const idx = lowerName.lastIndexOf('.')
  if (idx === -1) {
    return false
  }
  return getContext().feature.value.archiveEngineList.some(engine => engine.decompressExtensions.some(ext => lowerName.endsWith(ext.toLowerCase())))
}

const handler: FileOpenHandler = {
  id: 'view-archive',
  title: '查看压缩包',
  icon: 'mdi-folder-zip-outline',
  sort: 1,
  matcher(ctx, file) {
    if (ctx.readonly) {
      return false
    }
    return canViewArchiveFile(file.name)
  },
  async action(ctx, file) {
    const { format, engine } = resolveArchiveViewerOption(file.name, getContext().feature.value.archiveEngineList)
    if (!format || !engine) {
      SfcUtils.snackbar('未找到可用的解压引擎，无法查看压缩包内容')
      return
    }

    let archiveResourceList: ArchiveResource[] = []
    try {
      archiveResourceList = await SfcUtils.loadingDialogTask({ msg: '正在读取压缩包内容...' }, async p => {
        return (await SfcUtils.request(API.archive.listResources({
          engineProviderId: engine.engineId,
          engineProperty: {
            extension: `.${format}`
          },
          resourceRequest: {
            ...ctx.getProtocolParams(),
            path: ctx.path,
            name: file.name
          }
        }))).data.data as ArchiveResource[]
      })
    } catch (err) {
      SfcUtils.alert(err + '', '预览失败')
      return
    }

    SfcUtils.openComponentDialog(ArchiveResourceViewer, {
      title: `查看压缩包 - ${file.name}`,
      showConfirm: getContext().session.value.user.role != 'public',
      props: {
        archiveResourceList
      },
      extraDialogOptions: {
        maxWidth: '1200px',
        confirmText: '在线解压',
        cancelText: '关闭'
      },
      onConfirm() {
        ArchiveTaskService.openExtractDialogAndCreateTask({
          ctx,
          fileName: file.name,
          title: '在线解压'
        })
        return false
      },
    })
  }
}

export default handler