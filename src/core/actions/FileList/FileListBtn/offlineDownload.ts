import { SfcUtils } from '@/utils/SfcUtils'
import { MenuGroup } from '@/core/context'
import { FileListContext } from '@/core/model'
import { h, reactive } from 'vue'
import { CommonForm } from '@/utils/FormUtils'
import { DownloadTaskService } from '@/core/serivce/DownloadTaskService'
const offlineDownload: MenuGroup<FileListContext> = reactive({
  id: 'offline-download',
  name: '离线下载',
  renderOn(ctx) {
    return ctx != undefined && !ctx.readonly
  },
  icon: 'mdi-cloud-download',
  items: [
    {
      id: 'create-download',
      icon: 'mdi-plus',
      name: '创建下载',
      title: '创建下载',
      action(ctx) {
        DownloadTaskService.openCreateTask(ctx.uid, ctx.path, true)
      }
    },
    {
      id: 'view-download',
      icon: 'mdi-format-list-bulleted',
      name: '查看下载',
      title: '查看下载',
      action(ctx) {
        DownloadTaskService.openTaskView(ctx.uid, ctx.path, true)
      }
    }
  ]
})

export default offlineDownload