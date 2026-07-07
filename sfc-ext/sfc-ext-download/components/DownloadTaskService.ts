import { h } from 'vue'
import DownloadTaskView from './DownloadTaskView.vue'
import CreateDownloadForm from './CreateDownloadForm.vue'
import { VBtn } from 'vuetify/components'


const SfcUtils = window.SfcUtils

/**
 * 打开组件对话框的返回值接口
 */
interface DialogInstance {
  doConfirm(): void
  getComponentInstRef<T = Record<string, unknown>>(): T
}

/**
 * 下载任务服务 - 提供打开下载任务视图和创建下载任务对话框的功能
 */
export namespace DownloadTaskService {
  /**
   * 打开一个查看当前下载任务的对话框
   * @param uid 用户id
   * @param path 当前浏览路径
   * @param canOpenCreate 是否能够打开创建对话框
   */
  export function openTaskView(uid: number | string, path: string, canOpenCreate: boolean) {
    SfcUtils.openComponentDialog(DownloadTaskView, {
      header: () => {
        return h('div', [
          h('span', '离线下载任务'),
          canOpenCreate ? h('button', {
            onClick: () => openCreateTask(uid, path, false),
            style: 'margin-left: 12px'
          }, '+') : null
        ])
      },
      props: {
        uid,
        style: {
          height: '80vh',
          padding: '0 12px'
        }
      },
      extraDialogOptions: {
        maxWidth: '640px'
      },
      dense: true,
      showCancel: false
    })
  }

  /**
   * 打开一个创建下载任务的对话框
   * @param uid 用户id
   * @param path 默认下载路径
   * @param canOpenView 是否允许下载对话框中打开查看下载任务详情的对话框
   * @param onSuccess 提交成功后的回调，用于刷新外层状态
   */
  export function openCreateTask(uid: number | string, path: string, canOpenView: boolean, onSuccess?: () => void | Promise<void>) {
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
        const form = inst.getComponentInstRef() as unknown as { submit: () => Promise<{ success: boolean }> } | undefined
        if (form?.submit) {
          const ret = await form.submit()
          if (ret.success) {
            await onSuccess?.()
            return true
          }
        }
        return false
      },
      footer: !canOpenView ? () => '' : () => h(window.VuetifyComponent.VBtn, {
        color: 'primary' as string,
        onClick: () => {
          openTaskView(uid, path, false)
        }
      }, () => '查看下载')
    })
  }
}
