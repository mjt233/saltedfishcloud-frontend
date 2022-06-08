import { FileListContext } from '@/core/model'
import { MenuGroup } from '../type'

const commonGroup: MenuGroup<FileListContext> = {

  id: 'common',
  name: '通用功能',
  items: [
    {
      id: 'refresh',
      title: '刷新',
      async action(ctx) {
        return await ctx.modelHandler.refresh()
      },
      icon: 'mdi-refresh'
    }
  ]
}

export default commonGroup