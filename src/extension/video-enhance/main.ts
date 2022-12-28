import { FileOpenHandler, MenuGroup, MenuItem } from '@/core/context'
import { FileInfo, FileListContext } from '@/core/model'
import VideoEnhancePlayerVue from './components/VideoEnhancePlayer.vue'
import { VideoInfo } from './model'
import './boot'
import VideoInfoVue from './components/VideoInfo.vue'

const context = window.context
const SfcUtils = window.SfcUtils

/**
 * 获取字幕URL
 * @param ctx 文件列表上下文
 * @param file 要获取字幕的文件信息
 * @param streamIndex 字幕流索引
 */
function getSubtitleUrl(ctx: FileListContext, file: FileInfo, streamIndex: string) {
  if (!file.name.endsWith('.mkv')) {
    return null
  }
  const apiParams = {
    name: file.name,
    path: ctx.path,
    protocol: 'subtitle',
    targetId: ctx.uid,
    stream: streamIndex
  } as any
  if(ctx.protocol == 'main') {
    return window.SfcUtils.getApiUrl((window.API.resource.getCommonResource(apiParams)))
  }
  const protocolParams = ctx.getProtocolParams()
  apiParams.sourceProtocol = ctx.protocol
  apiParams.sourceId = protocolParams.id
  Object.keys(protocolParams).filter(k => k != 'id').forEach(k => {
    apiParams[k] = protocolParams[k]
  })
  return window.SfcUtils.getApiUrl((window.API.resource.getCommonResource(apiParams)))
}

/**
 * 获取视频资源的统一资源获取参数 
 */
async function getVideoResourceParams(ctx: FileListContext, file: FileInfo) {
  
  // 如果文件信息中没有所处路径数据，则通过节点id解析获取
  // 因为从搜索列表中传来的文件信息是没有path属性的
  let path = file.path
  if (!path) {
    path = (await SfcUtils.request(window.API.resource.parseNodeId(file.uid, file.node))).data.data
  }
  const apiParams = {
    name: file.name,
    path: path,
    targetId: ctx.uid,
    sourceProtocol: ctx.protocol
  } as any
  const protocolParams = ctx.getProtocolParams()
  apiParams.sourceId = protocolParams.id
  Object.keys(protocolParams).filter(k => k != 'id').forEach(k => {
    apiParams[k] = protocolParams[k]
  })
  return apiParams
}

/**
 * 获取视频信息 
 */
async function getVideoInfo(ctx: FileListContext, file: FileInfo): Promise<VideoInfo> {
  const params = await getVideoResourceParams(ctx, file)
  params.protocol = 'videoInfo'
  const res = await (await SfcUtils.request(window.API.resource.getCommonResource(params)))
  return res.data as VideoInfo
}

const videoType = new Set(['mp4', 'mkv', 'avi', 'rm', 'rmvb', 'm4v', 'flv', 'mpg', 'mpeg', 'mpe'])
/**
 * 判断是否为视频文件名
 * @param filename 文件名
 */
function isVideo(filename: string) {
  const extName = filename.split('.').pop()
  return !!extName && videoType.has(extName)
}

/**
 * 视频文件打开动作
 */
const videoOpenHandler: FileOpenHandler = {
  id: 'player',
  icon: 'mdi-play-circle',
  matcher(ctx, file) {
    if (file.mount) {
      return false
    }
    return isVideo(file.name)
  },
  title: '播放视频',
  async action(ctx, file) {
    try {
      SfcUtils.beginLoading()
      await window.SfcUtils.sleep(100)
      const videoInfo = await getVideoInfo(ctx, file)
      SfcUtils.openComponentDialog(VideoEnhancePlayerVue, {
        props: {
          url: ctx.getFileUrl(file),
          videoInfo: videoInfo,
          subtitleUrls: videoInfo.streams.filter(s => s.codecType == 'subtitle').map(s => {
            return {
              index: s.index,
              url: getSubtitleUrl(ctx, file, s.index)
            }
          })
        },
        dense: true,
        showCancel: false,
        title: '视频预览：' + file.name,
        extraDialogOptions: {
          maxWidth: '80%'
        }
      })
    } catch(err) {
      SfcUtils.snackbar(err)
    } finally {
      SfcUtils.closeLoading()
    }
    
  },
  sort: 0
}

/**
 * 视频文件右键菜单
 */
const videoMenu: MenuGroup<FileListContext> = {
  id: 'video',
  name: '视频',
  items: [
    {
      title: '视频信息',
      id: 'video-info',
      renderOn(ctx) {
        return ctx && ctx.selectFileList.length == 1 && !ctx.selectFileList[0].mount && isVideo(ctx.selectFileList[0].name)
      },
      icon: 'mdi-information-variant',
      sort: 0,
      async action(ctx) {
        const info = await getVideoInfo(ctx, ctx.selectFileList[0])
        window.SfcUtils.openComponentDialog(VideoInfoVue, {
          props: {
            videoInfo: info
          },
          title: `媒体信息：${ctx.selectFileList[0].name}`
        })
      }
    
    }
  ]
}

const originPlayerIndex = context.fileOpenHandler.value.findIndex(e => e.id == 'play-video')
if (originPlayerIndex != -1) {
  context.fileOpenHandler.value[originPlayerIndex] = videoOpenHandler
} else {
  context.fileOpenHandler.value.push(videoOpenHandler)
}

context.menu.value.fileListMenu.push(videoMenu)

export {}