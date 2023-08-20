import { ResourceRequest, StringFormatter } from 'sfc-common'
import { openFileEditDialog } from './codeEdit'

import SfcUtils from 'sfc-common/utils/SfcUtils'
import { FileOpenHandler } from '../type'
import { MarkdownEditor } from 'sfc-common/components'

const handler: FileOpenHandler = {
  
  icon: 'mdi-language-markdown',
  id: 'markdown-edit',
  matcher(ctx, file) {
    return (file.name || '').split('.').pop() == 'md'
  },
  sort: 1,
  title: 'MD编辑/预览',
  async action(ctx, file) {
    const url = ctx.getFileUrl(file)
    if (!url) {
      SfcUtils.alert('获取文件' + file.name + '的url失败')
      return
    }
    if (file.size > 1024 * 1024 * 5) {
      await SfcUtils.confirm(`文件较大(${StringFormatter.toSize(file.size)})，可能会导致浏览器卡死，是否继续？`, '文件过大')
    }
    openFileEditDialog(MarkdownEditor, {
      language: 'markdown',
      autoGrow: false,
      useMiniMap: true,
      readOnly: ctx.readonly,
      style: {
        height: '100%'
      },
      resourceParams: {
        name: '',
        path: ctx.path,
        protocol: ctx.protocol,
        targetId: ctx.uid,
        isCache: true,
        ...ctx.getProtocolParams()
      } as ResourceRequest
    }, url, ctx, file)
  }
}

export default handler