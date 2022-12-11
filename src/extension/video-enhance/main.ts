import { FileOpenHandler } from '@/core/context'
import { FileInfo, FileListContext } from '@/core/model'
import VideoEnhancePlayerVue from './components/VideoEnhancePlayer.vue'
import { VideoInfo } from './model'

const context = window.context
const SfcUtils = window.SfcUtils

function getSubtitleUrl(ctx: FileListContext, file: FileInfo, streamNo: string) {
  if (!file.name.endsWith('.mkv')) {
    return null
  }
  const apiParams = {
    name: file.name,
    path: ctx.path,
    protocol: 'subtitle',
    targetId: ctx.uid,
    stream: streamNo
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

function getVideoResourceParams(ctx: FileListContext, file: FileInfo) {
  const apiParams = {
    name: file.name,
    path: ctx.path,
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

async function getVideoInfo(ctx: FileListContext, file: FileInfo): Promise<VideoInfo> {
  const params = getVideoResourceParams(ctx, file)
  params.protocol = 'videoInfo'
  const res = await (await SfcUtils.request(window.API.resource.getCommonResource(params)))
  return res.data as VideoInfo
}

const videoOpenHandler: FileOpenHandler = {
  id: 'player',
  icon: 'mdi-play-circle',
  matcher(ctx, file) {
    return !file.mount && file.name.endsWith('.mp4') || file.name.endsWith('.mkv')
  },
  title: '播放视频',
  async action(ctx, file) {
    await window.SfcUtils.sleep(100)
    const videoInfo = await getVideoInfo(ctx, file)
    SfcUtils.openComponentDialog(VideoEnhancePlayerVue, {
      props: {
        url: ctx.getFileUrl(file),
        videoInfo: videoInfo,
        subtitleUrls: videoInfo.subtitleStreamList.map(s => {
          return {
            no: s.no,
            url: getSubtitleUrl(ctx, file, s.no)
          }
        })
        // url: SfcUtils.getApiUrl(window.API.resource.downloadFileByMD5(file.md5, file.name))
      },
      dense: true,
      showCancel: false,
      title: '视频预览：' + file.name,
      extraDialogOptions: {
        maxWidth: '80%'
      }
    })
    
  },
  sort: 0
}

const originPlayerIndex = context.fileOpenHandler.value.findIndex(e => e.id == 'play-video')
if (originPlayerIndex != -1) {
  context.fileOpenHandler.value[originPlayerIndex] = videoOpenHandler
} else {
  context.fileOpenHandler.value.push(videoOpenHandler)
}

export {}