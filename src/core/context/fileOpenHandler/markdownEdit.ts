import { openFileEditDialog } from './codeEdit'

import SfcUtils from '@/utils/SfcUtils'
import { FileOpenHandler } from '../type'
import { MarkdownEditor } from '@/components'

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
    openFileEditDialog(MarkdownEditor, {
      language: 'markdown',
      autoGrow: false,
      useMiniMap: true,
      readOnly: ctx.readonly,
      style: {
        height: '100%'
      }
    }, url, ctx, file)
  }
}

export default handler