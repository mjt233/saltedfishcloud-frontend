import { FileListContext } from '@/core/model'
import { MenuGroup } from '@/core/context'
import { ShareService } from '@/core/serivce/ShareService'

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
    },
    {
      id: 'share',
      title: '分享',
      icon: 'mdi-share-variant',
      action(ctx) {
        ShareService.createShare({
          name: ctx.selectFileList[0].name,
          uid: ctx.uid,
          path: ctx.path
        })
      },
      renderOn(ctx) {
        return ctx.uid != 0 && !ctx.readonly && ctx.selectFileList && ctx.selectFileList.length == 1
      }
    }
  ]
}

export default commonGroup