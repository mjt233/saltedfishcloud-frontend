import { context } from '@/core/context'
import { FileInfo } from '@/core/model'
import { StringUtils } from '@/utils/StringUtils'
import API from '@/api'
import { FileOpenHandler } from './type'
import SfcUtils from '@/utils/SfcUtils'
import { createTextVNode, reactive } from 'vue'
import ImagePreviewerVue from '@/components/common/Previewer/ImagePreviewer.vue'
import { CodeEditor, VideoPlayer } from '@/components'
import { dyncmount } from '@/utils/SfcUtils/common/DyncMount'
import { extname } from 'path'
const imgTypes = new Set(['jpeg', 'jpg', 'gif', 'png', 'bmp', 'icon'])
function isImgType(name: string) {
  const extName = name.split('.').pop() as string
  return imgTypes.has(extName)
}

const defaultFileOpenHandlers: FileOpenHandler[] = reactive([
  {
    icon: 'mdi-earth',
    id: 'default',
    matcher: () => true,
    sort: 1,
    title: '浏览器打开',
    async action(ctx, file) {
      try {
        const url = ctx.getFileUrl(file)
        if (!url) {
          SfcUtils.alert('获取文件' + file.name + '的url失败')
          return
        }
        SfcUtils.openUrl(url)
      } catch (err) {
        SfcUtils.snackbar(err)
      }
    }
  },
  {
    icon: 'mdi-image',
    id: 'img-preview',
    isDefault: true,
    matcher(ctx, file) {
      return isImgType(file.name.toLowerCase())
    },
    title: '图像预览',
    sort: 2,
    action(ctx, file) {
      /**
       * 挂载的文件系统中的图片暂不处理，后续再想办法解决下
       */
      const files = ctx.fileList.filter(e => !e.dir && isImgType(e.name.toLowerCase()))
      const index = files.findIndex(e => e.md5 == file.md5 && e.name == file.name)
      const inst = dyncmount( ImagePreviewerVue, {
        props: {
          imageIndex: index == -1 ? 0 : index,
          fileList: files,
          style: {
            position: 'fixed',
            height: '100vh',
            width: '100vw',
            top: 0,
            left: 0,
            zIndex: '114514'
          },
          onClose() {
            inst.unmount()
          },
          urlGenerator(file: FileInfo) {
            return ctx.getFileUrl(file)
          },
          thumbnailUrlGenerator(file: FileInfo) {
            return ctx.getThumbnailUrl(file)
          }
        },
        vappProps: {
          style: {
            zIndex: 114514,
            background: 'none'
          }
        },
        tempDOMHandler(dom) {
          dom.style.zIndex = '114514'
        }
      })
    }
  },
  {
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
  },
  {
    id: 'code-edit',
    title: '编辑器',
    icon: 'mdi-pencil',
    matcher(ctx, file) {
      if (ctx.readonly) {
        return false
      }
      const extName = file.name.split('.').pop()?.toLowerCase() || file.name
      const supportType = new Set([
        'js', 'ts', 'tsx', 'jsx',
        'html', 'htm', 
        'css', 'scss', 'less',
        'python', 'php', 'c', 'cpp','java', 'json','bat', 'lua',
        'txt', 'ini', 'log', 'md', 'properties', 'cfg', 'vue'
      ])
      return supportType.has(extName)
    },
    sort: 0,
    async action(ctx, file) {
      const url = ctx.getFileUrl(file)
      if (!url) {
        throw new Error('无法获取文件url')
      }
      const extName = file.name.split('.').pop()?.toLowerCase() || file.name

      // 匹配语言
      let language
      if (['js', 'ts', 'tsx', 'jsx'].includes(extName)) {
        language = 'javascript'
      } else if (extName == 'json') {
        language = 'json'
      } else if (['html', 'htm', 'vue'].includes(extName)) {
        language = 'html'
      } else if (['css', 'less', 'scss'].includes(extName)) {
        language = 'css'
      } else if (extName == 'java') {
        language = 'java'
      } else if (extName == 'md') {
        language = 'markdown'
      } else {
        language = 'editor'
      }
      SfcUtils.beginLoading()
      try {
        const session = context.session.value
        const ret = await SfcUtils.request({ url })
        let newText = ret.request.responseText
        SfcUtils.openComponentDialog(CodeEditor, {
          props: {
            autoGrow: false,
            useMiniMap: true,
            modelValue: ret.request.responseText,
            'onUpdate:modelValue'(val: string) {
              newText = val
            },
            language,
            style: {
              height: '100%'
            }
          },
          fullscreen: true,
          persistent: true,
          title: file.name,
          showConfirm: !!session.token && (file.uid == session.user.id) || (file.uid == 0 && session.user.role == 'admin'),
          async onConfirm() {
            try {
              if (newText == ret.request.responseText) {
                SfcUtils.snackbar('文件无变更')
                return true
              }
              let path = ctx.path || file.path
              if (!path) {
                path = (await SfcUtils.request(API.resource.parseNodeId(file.uid, file.node))).data.data
                if (!path) {
                  throw new Error('无法获取到文件路径')
                }
              }
              const newFile = new File([new Blob([newText])], file.name, { type: 'text/plain'})
              SfcUtils.beginLoading()
              await SfcUtils.request(API.file.upload(file.uid, path, newFile))
              await ctx.modelHandler.refresh()
              SfcUtils.snackbar('保存成功')
            } catch(err) {
              SfcUtils.snackbar(err)
              return false
            } finally {
              SfcUtils.closeLoading()
            }
            return true
          }
        })
      } finally {
        SfcUtils.closeLoading()
      }
    }
  }
])
export {
  defaultFileOpenHandlers
}