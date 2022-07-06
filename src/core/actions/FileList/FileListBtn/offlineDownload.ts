import { SfcUtils } from '@/utils/SfcUtils'
import { MenuGroup } from '@/core/context'
import { FileListContext } from '@/core/model'
import { h, reactive } from 'vue'
import CreateDownloadForm from '@/components/form/CreateDownloadForm.vue'
import { CommonForm } from '@/utils/FormUtils'
import DownloadTaskView from '@/components/common/DownloadTask/DownloadTaskView.vue'
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
        // todo: 以下可封装为专门以对话框方式打开表单的方法
        const dialog = SfcUtils.dialog({
          title: '创建下载任务',
          children: () => h(CreateDownloadForm, reactive({
            uid: ctx.uid,
            savePath: ctx.path,
            ref: 'form',
            onSubmit() {
              dialog.doConfirm()
            }
          })),
          async onConfirm() {
            const res = await (dialog.handler.value.getRoot().$refs.form as CommonForm).submit()
            if (res.success) {
              SfcUtils.snackbar('创建成功')
              return true
            } else {
              SfcUtils.snackbar(res.err)
              return false
            }
          },
          onCancel() {
            return true
          }
        })
      }
    },
    {
      id: 'view-download',
      icon: 'mdi-format-list-bulleted',
      name: '查看下载',
      title: '查看下载',
      action(ctx) {
        const dialog = SfcUtils.openComponentDialog(DownloadTaskView, {
          props: {
            uid: ctx.uid,
            style: {
              height: '80vh',
              padding: '0 12px'
            },
          },
          extraDialogOptions: {
            maxWidth: '640px'
          },
          title: '下载任务',
          dense: true,
          showCancel: false
        })
      }
    }
  ]
})

export default offlineDownload