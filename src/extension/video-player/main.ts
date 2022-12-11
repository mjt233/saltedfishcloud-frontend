import { FileInfo, FileListContext } from '@/core/model'
import VideoPlayerVue from './components/VideoPlayer.vue'

const context = window.context
const SfcUtils = window.SfcUtils

function getSubtitleUrl(ctx: FileListContext, file: FileInfo) {
  return null
  // if (!file.name.endsWith('.mkv')) {
  //   return null
  // }
  // const apiParams = {
  //   name: file.name,
  //   path: ctx.path,
  //   protocol: 'subtitle',
  //   targetId: ctx.uid,
  //   sourceProtocol: ctx.protocol,
  //   stream: '0:44'
  // } as any
  // if(ctx.protocol == 'main') {
  //   return window.SfcUtils.getApiUrl((window.API.resource.getCommonResource(apiParams)))
  // }
  // const protocolParams = ctx.getProtocolParams()
  // apiParams.sourceId = protocolParams.id
  // Object.keys(protocolParams).filter(k => k != 'id').forEach(k => {
  //   apiParams[k] = protocolParams[k]
  // })
  // return window.SfcUtils.getApiUrl((window.API.resource.getCommonResource(apiParams)))
}

context.fileOpenHandler.value.push({
  id: 'player',
  icon: 'mdi-play-circle',
  matcher(ctx, file) {
    return !file.mount && file.name.endsWith('.mp4') || file.name.endsWith('.mkv')
  },
  title: '在线预览',
  action(ctx, file) {
    setTimeout(() => {
      SfcUtils.openComponentDialog(VideoPlayerVue, {
        props: {
          url: ctx.getFileUrl(file),
          subtitleUrl: getSubtitleUrl(ctx, file)
          // url: SfcUtils.getApiUrl(window.API.resource.downloadFileByMD5(file.md5, file.name))
        },
        dense: true,
        showCancel: false,
        title: '视频预览：' + file.name,
        extraDialogOptions: {
          maxWidth: '80%'
        }
      })
    }, 100)
    
  },
  sort: 0
})

export {}