import { SfcUtils } from 'sfc-common/utils/SfcUtils'
import { MenuGroup } from 'sfc-common/core/context'
import { FileListContext } from 'sfc-common/model'
import { h, reactive } from 'vue'
import { CommonForm } from 'sfc-common/utils/FormUtils'
import { DownloadTaskService } from 'sfc-common/core/serivce/DownloadTaskService'
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