import SfcUtils from '@/utils/SfcUtils'
import { FileOpenHandler } from '../type'

const handler: FileOpenHandler = {
  
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
}

export default handler