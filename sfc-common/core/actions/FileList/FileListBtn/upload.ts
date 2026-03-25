import type { MenuGroup } from 'sfc-common/core/context'
import type { FileListContext } from 'sfc-common/model'

export const uploadMenuGroup = {
  
  id: 'upload',
  name: '上传',
  icon: 'mdi-upload',
  renderOn(ctx) {
    return ctx != undefined && !ctx.readonly
  },
  items: [
    
    {
      id: 'upload-file',
      title: '上传文件',
      icon: 'mdi-upload',
      action(ctx) {
        ctx.modelHandler.upload()
      }
    },
    {
      id: 'upload-dir',
      title: '上传文件夹',
      action(e) {
        e.modelHandler.uploadDir()
      },
      renderOn(ctx) {
        return !ctx.readonly
      },
      icon: 'mdi-folder-arrow-up-outline'
    },
  ]
} as MenuGroup<FileListContext>