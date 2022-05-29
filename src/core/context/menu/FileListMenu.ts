import { FileListContext } from '@/core/model'
import { MenuGroup } from './type.d'
const defaultFileListMenu: MenuGroup<FileListContext>[] = [
  {
    // 新增菜单
    id: 'add',
    name: '新增',
    items: [
      {
        id: 'upload',
        title: '上传',
        action(e) {
          return e.modelHandler.upload()
        },
        renderOn(ctx) {
          return !ctx.readonly
        },
        icon: 'mdi-upload'
      },
      {
        id: 'mkdir',
        title: '新建文件夹',
        action(e) {
          return e.modelHandler.mkdir()
        },
        renderOn(ctx) {
          return !ctx.readonly
        },
        icon: 'mdi-folder-plus'
      }
    ]
  },
  {
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
  },
  {
    id: 'action',
    name: '文件操作',
    items: [
      {
        id: 'rename',
        title: '重命名',
        icon: 'mdi-form-textbox'
      }
    ]
  }
]

export {
  defaultFileListMenu
}