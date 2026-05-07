import { dyncmount } from 'sfc-common/utils/SfcUtils/common/DyncMount'
import ImageViewerVue from 'sfc-common/components/common/Previewer/ImageViewer.vue'
import { FileInfo } from 'sfc-common/model'
import { FileOpenHandler } from '../type'

const imgTypes = new Set(['jpeg', 'jpg', 'gif', 'png', 'bmp', 'icon', 'webp'])
function isImgType(name: string) {
  const extName = name.split('.').pop() as string
  return imgTypes.has(extName)
}

const handler: FileOpenHandler = {
  icon: 'mdi-image',
  id: 'img-viewer',
  isDefault: true,
  matcher(ctx, file) {
    return isImgType(file.name.toLowerCase())
  },
  title: '图片浏览器',
  sort: 1,
  action(ctx, file) {
    const files = ctx.fileList.filter(e => !e.dir && isImgType(e.name.toLowerCase()))
    const index = files.findIndex(e => e.md5 == file.md5 && e.name == file.name)
    const inst = dyncmount(ImageViewerVue, {
      props: {
        imageIndex: index == -1 ? 0 : index,
        fileList: files,
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
}

export default handler
