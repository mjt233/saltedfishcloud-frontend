import VideoPlayerVue from './components/VideoPlayer.vue'

const context = window.context
const SfcUtils = window.SfcUtils

context.fileOpenHandler.value.push({
  id: 'player',
  icon: 'mdi-play-circle',
  matcher(ctx, file) {
    return file.name.endsWith('.mp4')
  },
  title: '在线预览',
  action(ctx, file) {
    setTimeout(() => {
      SfcUtils.openComponentDialog(VideoPlayerVue, {
        props: {
          url: ctx.getFileUrl(file)
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