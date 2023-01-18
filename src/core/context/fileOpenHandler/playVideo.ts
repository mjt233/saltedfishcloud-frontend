
import { VideoPlayer } from '@/components'
import SfcUtils from '@/utils/SfcUtils'
import { FileOpenHandler } from '../type'

const handler: FileOpenHandler = {
  // 默认的视频播放器，当加载了视频增强插件时该项不可用
  id: 'play-video',
  title: '播放视频',
  icon: 'mdi-play-circle',
  sort: 0,
  matcher(ctx, file) {
    const extName = file.name.split('.').pop()?.toLowerCase()
    return extName == 'mp4' || extName == 'mkv'
  },
  async action(ctx, file) {
    SfcUtils.openComponentDialog(VideoPlayer, {
      props: {
        url: ctx.getFileUrl(file)
      },
      dense: true,
      showCancel: false,
      title: '视频预览：' + file.name,
      extraDialogOptions: {
        maxWidth: '80%'
      }
    })
  }
}

export default handler