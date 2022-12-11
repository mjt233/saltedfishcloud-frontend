import { FileInfo } from '@/core/model'
import { StringUtils } from '@/utils/StringUtils'
import API from '@/api'
import { FileOpenHandler } from './type'
import SfcUtils from '@/utils/SfcUtils'
import { reactive } from 'vue'
import ImagePreviewerVue from '@/components/common/Previewer/ImagePreviewer.vue'
import { VideoPlayer } from '@/components'
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
])
export {
  defaultFileOpenHandlers
}