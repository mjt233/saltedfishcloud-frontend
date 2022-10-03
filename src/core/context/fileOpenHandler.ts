import { StringUtils } from '@/utils/StringUtils'
import API from '@/api'
import { FileOpenHandler } from './type'
import SfcUtils from '@/utils/SfcUtils'
import { reactive } from 'vue'
import ImagePreviewerVue from '@/components/common/Previewer/ImagePreviewer.vue'
import { dyncmount } from '@/utils/SfcUtils/common/DyncMount'
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
        let url: string
        if (file.mount) {
          // 挂载的外部文件系统无法通过md5直接下载，需要通过路径下载
          const res = await SfcUtils.request(API.resource.getFileDC(file.uid, ctx.path, file.name, file.md5, 1))
          url = SfcUtils.getApiUrl(API.resource.downloadUseFileDC(res.data.data, false, file.name))
        } else {
          url = StringUtils.appendPath(API.getDefaultPrefix(), API.resource.downloadFileByMD5(file.md5, file.name).url)
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
      /**
       * 挂载的文件系统中的图片暂不处理，后续再想办法解决下
       */
      if(!file.mount && isImgType(file.name)) {
        return true
      } else {
        return false
      }
    },
    title: '图像预览',
    sort: 2,
    action(ctx, file) {
      /**
       * 挂载的文件系统中的图片暂不处理，后续再想办法解决下
       */
      const files = ctx.fileList.filter(e => !e.dir && !e.mount && isImgType(e.name))
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
])
export {
  defaultFileOpenHandlers
}