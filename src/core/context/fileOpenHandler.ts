import { StringUtils } from '@/utils/StringUtils'
import API from '@/api'
import { FileOpenHandler } from './type'
import SfcUtils from '@/utils/SfcUtils'

const defaultFileOpenHandler: FileOpenHandler = {
  icon: 'mdi-earth',
  id: 'defaultHandler',
  matcher: () => true,
  sort: 1,
  title: '浏览器打开',
  action(ctx, file) {
    const url = StringUtils.appendPath(API.getDefaultPrefix(), API.resource.downloadFileByMD5(file.md5, file.name).url)
    SfcUtils.openUrl(url)
  }
}

const textFileOpenHandler: FileOpenHandler = {
  icon: 'mdi-pencil',
  id: 'textHandler',
  matcher(ctx, file) {
    return file.name.endsWith('.txt')
  },
  title: '编辑',
  sort: 2,
  action(ctx, file) {
    throw new Error('功能未实现')
  }
}

const cancelFileOpenHandler: FileOpenHandler = {
  icon: 'mdi-cancel',
  id: 'cancelHandler',
  matcher(ctx, file) {
    return file.name.endsWith('.txt')
  },
  title: '我点错了',
  sort: 2,
  action(ctx, file) {
    SfcUtils.snackbar('好吧，这个是测试功能')
  }
}

export {
  defaultFileOpenHandler,
  textFileOpenHandler,
  cancelFileOpenHandler
}