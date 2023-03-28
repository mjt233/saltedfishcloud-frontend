import { FileOpenHandler, MenuGroup, MenuItem,FileInfo, FileListContext, ResourceRequest } from 'sfc-common'
import VideoEnhancePlayerVue from './components/VideoEnhancePlayer.vue'
import { EncodeConvertRule, VideoInfo } from './model'
import './boot'
import VideoInfoVue from './components/VideoInfo.vue'
import VideoConvertForm from './components/VideoConvertForm.vue'
import { VEAPI } from './api'
import { h } from 'vue'
import EncodeConvertTask from './components/EncodeConvertTask.vue'
import VideoEnhanceCheck from './components/VideoEnhanceCheck.vue'

const context = window.context
const SfcUtils = window.SfcUtils

/**
 * 获取字幕URL
 * @param ctx 文件列表上下文
 * @param file 要获取字幕的文件信息
 * @param path 文件所在路径
 * @param streamIndex 字幕流索引
 */
function getSubtitleUrl(ctx: FileListContext, file: FileInfo, path: string, streamIndex: string) {
  if (!file.name.endsWith('.mkv')) {
    return null
  }
  const apiParams = {
    name: file.name,
    path: path,
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
async function getVideoResourceParams(ctx: FileListContext, file: FileInfo, path: string): Promise<ResourceRequest> {
  const apiParams = {
    name: file.name,
    path: path,
    targetId: ctx.uid,
    sourceProtocol: ctx.protocol || 'main',
    protocol: ctx.protocol || 'main'
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
async function getVideoInfo(ctx: FileListContext, file: FileInfo, path: string): Promise<VideoInfo> {
  const params = await getVideoResourceParams(ctx, file, path)
  params.protocol = 'videoInfo'
  const res = await (await SfcUtils.request(window.API.resource.getCommonResource(params)))
  return res.data as VideoInfo
}

const videoType = new Set(['mp4', 'mkv', 'avi', 'rm', 'rmvb', 'm4v', 'flv', 'mpg', 'mpeg', 'mpe', 'ts'])
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
    return isVideo(file.name)
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
      const videoInfo = await getVideoInfo(ctx, file, path)
      SfcUtils.openComponentDialog(VideoEnhancePlayerVue, {
        props: {
          url: ctx.getFileUrl(file),
          videoInfo: videoInfo,
          subtitleUrls: videoInfo.streams.filter(s => s.codecType == 'subtitle').map(s => {
            return {
              index: s.index,
              url: getSubtitleUrl(ctx, file, path as string, s.index)
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
      title: '视频转码',
      id: 'video-convert',
      icon: 'mdi-cached',
      renderOn(ctx) {
        return ctx && ctx.selectFileList.length == 1 && !ctx.selectFileList[0].mount && isVideo(ctx.selectFileList[0].name) && !ctx.readonly
      },
      async action(ctx) {
        const file = ctx.selectFileList[0]
        const info = await getVideoInfo(ctx, file, file.path as string)
        const handler = window.SfcUtils.openComponentDialog(VideoConvertForm, {
          props: {
            videoInfo: info
          },
          title: `视频转码：${ctx.selectFileList[0].name}`,
          async onConfirm() {
            const dialog = window.SfcUtils.loadingDialog({ msg: '任务创建中' })
            try {
              const result = await handler.getInstAsForm().submit()
              if (result.success) {
                const rules = handler.getInstAsForm().getFormData().enabledConvertRules as EncodeConvertRule[]
                const source = await getVideoResourceParams(ctx, file, file.path as string)
                const target = await getVideoResourceParams(ctx, file, file.path as string)
                target.name = 'convert_' + target.name
                await window.SfcUtils.request(VEAPI.encodeConvert({rules, source, target}))
                window.SfcUtils.snackbar('任务创建成功')
                return true
              } else {
                return false
              }
            } catch (err) {
              SfcUtils.snackbar(err)
              return false
            } finally {
              dialog.close()
            }
          }
        })
      }
    },
    {
      title: '视频信息',
      id: 'video-info',
      renderOn(ctx) {
        return ctx && ctx.selectFileList.length == 1 && !ctx.selectFileList[0].mount && isVideo(ctx.selectFileList[0].name)
      },
      icon: 'mdi-information-variant',
      async action(ctx) {
        const info = await getVideoInfo(ctx, ctx.selectFileList[0], ctx.selectFileList[0].path as string)
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

const originPlayerIndex = context.fileOpenHandler.value.findIndex(e => e.id == 'play-video')
if (originPlayerIndex != -1) {
  context.fileOpenHandler.value[originPlayerIndex] = videoOpenHandler
} else {
  context.fileOpenHandler.value.push(videoOpenHandler)
}

context.menu.value.fileListMenu.push(videoMenu)

window.bootContext.addProcessor({
  taskName: '注册组件-video-enhance',
  execute(app) {
    app.component(VideoEnhanceCheck.name, VideoEnhanceCheck)
  }
})

export {}