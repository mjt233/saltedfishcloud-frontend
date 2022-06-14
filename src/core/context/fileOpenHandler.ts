import { StringUtils } from '@/utils/StringUtils'
import API from '@/api'
import { FileOpenHandler } from './type'

const defaultFileOpenHandler: FileOpenHandler = {
  icon: 'mdi-download',
  id: 'defaultHandler',
  matcher: () => true,
  sort: 1,
  title: '下载',
  action(ctx, files) {
    files.forEach(file => {
      const url = StringUtils.appendPath(API.getDefaultPrefix(), API.resource.downloadFileByMD5(file.md5, file.name).url)
      window.open(url)
    })
  }
}

export {
  defaultFileOpenHandler
}