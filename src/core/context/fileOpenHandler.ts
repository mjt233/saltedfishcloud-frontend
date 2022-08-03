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
    action(ctx, file) {
      const url = StringUtils.appendPath(API.getDefaultPrefix(), API.resource.downloadFileByMD5(file.md5, file.name).url)
      SfcUtils.openUrl(url)
    }
  },
  {
    icon: 'mdi-image',
    id: 'img-preview',
    matcher(ctx, file) {
      if(isImgType(file.name)) {
        return true
      } else {
        return false
      }
    },
    title: '图像预览',
    sort: 2,
    action(ctx, file) {
      const files = ctx.fileList.filter(e => !e.dir && isImgType(e.name))
      const inst = dyncmount( ImagePreviewerVue, {
        props: {
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