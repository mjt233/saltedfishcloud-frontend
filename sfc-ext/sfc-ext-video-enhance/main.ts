import { FileOpenHandler, MenuGroup,FileInfo, FileListContext, ResourceRequest, getContext } from 'sfc-common'
import VideoEnhancePlayerVue from './components/player/VideoEnhancePlayer.vue'
import { EncodeConvertFormData, Format, StreamInfo, Subtitle, VideoInfo } from './model'
import './boot'
import VideoInfoVue from './components/VideoInfo.vue'
import VideoConvertForm from './components/form/VideoConvertForm.vue'
import { h, reactive } from 'vue'
import EncodeConvertTask from './components/EncodeConvertTask.vue'
import { VEUtils } from './core/VEUtils'
import * as actions from './core/actions'
import { ConvertTaskCreator } from './core/convertTaskCreator'
import { LoadingDialogParam } from 'sfc-common/utils/SfcUtils/common/Dialog'

const context = window.context
const SfcUtils = window.SfcUtils

// 获取原版内置的播放器组件
const originPlayerIndex = context.fileOpenHandler.value.findIndex(e => e.id == 'play-video')
const originPlayer = originPlayerIndex == -1 ? null : context.fileOpenHandler.value[originPlayerIndex]

/**
 * 视频文件打开动作
 */
const videoOpenHandler: FileOpenHandler = {
  id: 'player',
  icon: 'mdi-play-circle',
  matcher(ctx, file) {
    return actions.isVideo(file.name)
  },
  title: '播放视频',
  async action(ctx, file) {
    try {
      // 如果文件信息中没有所处路径数据，则通过节点id解析获取
      // 因为从搜索列表中传来的文件信息是没有path属性的
      let path = file.path
      if (!path) {
        path = (await SfcUtils.request(window.API.resource.parseNodeId(file.uid, file.node))).data.data
      }
      SfcUtils.beginLoading()
      await window.SfcUtils.sleep(100)
      let videoInfo:VideoInfo
      try {
        videoInfo = await actions.getVideoInfo(ctx, file, path)
      } catch (err) {
        console.error(err)
        videoInfo = {
          chapters: [],
          format: {} as Format,
          streams: []
        }
      }
      

      const subtitleList: Subtitle[] = []
      // 尝试获取外挂字幕信息
      const dotIdx = file.name.lastIndexOf('.')
      if (dotIdx != -1) {
        const noExtName = file.name.substring(0, dotIdx)
        ctx.fileList
          .filter(f => {
            return f.name.startsWith(noExtName + '.') && VEUtils.isSupportSubtitleType(f.name.split('.').pop() || f.name)
          })
          .forEach(subtitleFile => {
            const url = actions.getSubtitleUrl(ctx, subtitleFile, path, '0')
            if (url) {
              const ext = subtitleFile.name.split('.').pop()?.toLowerCase()
              const type = (ext === 'vtt' || ext === 'srt') ? 'webvtt' : ext === 'ass' ? 'ass' : 'sup'
              subtitleList.push({
                title: `[外挂字幕].${ext}`,
                url: url,
                type: type,
                isDefault: true
              })
            }
          })
      }
      
      // 尝试从视频数据流中获取内嵌字幕信息
      videoInfo.streams.filter(s => s.codecType == 'subtitle').forEach(s => {
        subtitleList.push({
          title: `${s.language}${s.title ? '(' + s.title + ')' : ''}${VEUtils.isSupportSubtitleType(s.codecName) ? '' : '  [不支持的类型 - ' + s.codecName + ']'}`,
          url: actions.getSubtitleUrl(ctx, file, path as string, s.index),
          type: VEUtils.getSubtitleServerType(s.codecName),
          isDefault: s.disposition?.default == '1'
        } as Subtitle)
      })

      SfcUtils.openComponentDialog(VideoEnhancePlayerVue, {
        props: {
          url: ctx.getFileUrl(file),
          videoInfo: videoInfo,
          subtitleList: subtitleList,
          file: file
        },
        dense: true,
        showCancel: false,
        title: '视频预览：' + file.name,
        extraDialogOptions: {
          maxWidth: '80%'
        }
      })
    } catch(err) {
      // 增强版播放器播放失败，改用原版
      if(originPlayer && originPlayer.matcher(ctx, file)) {
        SfcUtils.snackbar(`增强版播放器播放失败, 改用通用版本。原因: ${err}`)
        originPlayer.action(ctx, file)
      } else {
        SfcUtils.snackbar(err)
      }
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
      title: '视频转码',
      id: 'video-convert',
      icon: 'mdi-cached',
      renderOn(ctx) {
        return ctx && !ctx.readonly && ctx.selectFileList.length >= 1 && ctx.selectFileList.some(f => f.dir || actions.isVideo(f.name))
      },
      async action(ctx) {
        const aFile = ctx.selectFileList[0]
        const isMultiple = ctx.selectFileList.length > 1 || ctx.selectFileList.some(f => f.dir)
        const info = isMultiple ? undefined : await actions.getVideoInfo(ctx, aFile, aFile.path as string)
        const handler = window.SfcUtils.openComponentDialog(VideoConvertForm, {
          props: {
            videoInfo: info,
            fileInfo: ctx.selectFileList,
            uid: ctx.uid
          },
          title: isMultiple ? '批量转码' : '视频转码',
          persistent: true,
          async onConfirm() {
            try {
              const form = handler.getInstAsForm()
              const result = await form.submit()
              if (result.success) {

                const creator = new ConvertTaskCreator(ctx, form.getFormData())
                const baseMsg = '正在创建任务..'
                const dialogProps: LoadingDialogParam = reactive({
                  msg: baseMsg
                })
                const loading = window.SfcUtils.loadingDialog(dialogProps)
                let error: any
                creator.addEventListener('error', err => error = err)
                creator.addEventListener('ended', async isSuccess => {
                  loading.close()
                  if (isSuccess) {
                    SfcUtils.snackbar('转码任务创建成功')
                    SfcUtils.openComponentDialog(EncodeConvertTask, {
                      props: {
                        uid: ctx.uid,
                        useCard: false
                      },
                      title: '转码任务列表'
                    })
                  } else {
                    SfcUtils.alert('转码任务创建失败: ' + error)
                  }
                })
                await creator.startCreate()
                return true
              } else {
                return false
              }
            } catch (err) {
              SfcUtils.snackbar(err)
              return false
            }
          }
        })
      }
    },
    {
      title: '视频信息',
      id: 'video-info',
      renderOn(ctx) {
        return ctx && ctx.selectFileList.length == 1 && !ctx.selectFileList[0].isMount && actions.isVideo(ctx.selectFileList[0].name)
      },
      icon: 'mdi-information-variant',
      async action(ctx) {
        const info = await actions.getVideoInfo(ctx, ctx.selectFileList[0], ctx.selectFileList[0].path as string)
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

context.menu.value.boxMenu.push({
  name: '视频服务',
  id: 'video',
  items: [
    {
      id: 'encoder-convert',
      title: '视频转码',
      icon: 'mdi-cached',
      renderOn() {
        return !!context.session.value.token
      },
      action(ctx) {
        ctx.title = '视频转码'
        ctx.currentComponent = h(EncodeConvertTask, {
          style: {
            maxWidth: '640px',
            margin: 'auto'
          },
          uid: context.session.value.user.id
        })
      }
    }
  ]
})

if (originPlayerIndex != -1) {
  context.fileOpenHandler.value[originPlayerIndex] = videoOpenHandler
} else {
  context.fileOpenHandler.value.push(videoOpenHandler)
}
context.menu.value.fileListMenu.push(videoMenu)

export {}
