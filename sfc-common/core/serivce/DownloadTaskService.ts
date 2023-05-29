import { IdType } from './../model/Common'
import { VBtn } from 'vuetify/components'
import DownloadTaskView from 'sfc-common/components/common/DownloadTask/DownloadTaskView.vue'
import DownloadTaskHeader from 'sfc-common/components/common/DownloadTask/DownloadTaskHeader.vue'
import CreateDownloadForm from 'sfc-common/components/form/CreateDownloadForm.vue'
import { h } from 'vue'
import { StringUtils } from 'sfc-common/utils/StringUtils'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { CommonForm } from 'sfc-common/utils/FormUtils'



export namespace DownloadTaskService {
  /**
   * 打开一个查看当前下载任务的对话框
   * @param uid 用户id
   * @param path 当前浏览路径
   * @param canOpenCreate 是否能够打开创建对话框
   */
  export function openTaskView(uid: IdType, path: string, canOpenCreate: boolean) {
    return SfcUtils.openComponentDialog(DownloadTaskView, {
      header: () => h(DownloadTaskHeader, {
        uid,
        path,
        canOpenCreate
      }),
      props: {
        uid,
        style: {
          height: '80vh',
          padding: '0 12px'
        },
      },
      extraDialogOptions: {
        maxWidth: '640px'
      },
      // title: '下载任务',
      dense: true,
      showCancel: false
    })
  }

  /**
   * 打开一个创建下载任务的对话框
   * @param uid 用户id
   * @param path 默认下载路径
   * @param canOpenView 是否允许下载对话框中打开查看下载任务详情的对话框
   */
  export function openCreateTask(uid: IdType, path: string, canOpenView: boolean) {
    const inst = SfcUtils.openComponentDialog(CreateDownloadForm, {
      props: {
        uid,
        savePath: path,
        onSubmit: () => {
          inst.doConfirm()
        }
      },
      extraDialogOptions: {
        maxWidth: '720px'
      },
      title: '创建下载任务',
      onConfirm: async() => {
        const form = inst.getComponentInstRef() as any as CommonForm
        const ret = await form.submit()
        if (ret.success) {
          return true
        } else {
          return false
        }
      },
      footer: !canOpenView ? () => '' : () => h(VBtn, {
        color: 'primary',
        onClick: () => {
          DownloadTaskService.openTaskView(uid, path, false)
        }
      }, () => '查看下载')
    })
  }
}