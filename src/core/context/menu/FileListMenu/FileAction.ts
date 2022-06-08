import { FileListContext } from '@/core/model'
import { MenuGroup } from '../type'

const fileActionGroup: MenuGroup<FileListContext> = 
{
  id: 'action',
  name: '文件操作',
  items: [
    {
      id: 'rename',
      title: '重命名',
      icon: 'mdi-form-textbox',
      renderOn(ctx) {
        return !ctx.readonly && ctx.selectFileList.length == 1
      },
      async action(ctx) {
        const fileInfo = ctx.selectFileList[0]
        await ctx.modelHandler.rename(fileInfo.name, fileInfo.md5)
        await ctx.modelHandler.refresh()
      }
    }
  ]
}

export default fileActionGroup