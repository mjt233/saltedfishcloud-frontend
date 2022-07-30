import { ShareInfo } from '@/api/share'
import FileShareSuccessVue from '@/components/common/FileShare/FileShareSuccess.vue'
import FileShareCreateFormVue from '@/components/common/FileShare/Form/FileShareCreateForm.vue'
import { CommonForm } from '@/utils/FormUtils'
import SfcUtils from '@/utils/SfcUtils'
import { StringUtils } from '@/utils/StringUtils'
import { h } from 'vue'
import { VBtn } from 'vuetify/components'

export interface CreateShareFormConfig {
  /** 用户id */
  uid: number

  /** 被分享的文件所在路径 */
  path: string

  /** 被分享的文件名 */
  name: string
}

export namespace ShareService {
  export function createShare(opt: CreateShareFormConfig) {
    const createDialog = SfcUtils.openComponentDialog(FileShareCreateFormVue, {
      props: {
        uid: opt.uid,
        path: opt.path,
        name: opt.name
      },
      title: '创建分享：' + opt.name,
      async onConfirm() {
        try {
          const res = await (createDialog.getComponentInstRef() as any as CommonForm).submit()
          if (res.success) {
            const shareInfo = res.data?.data.data as ShareInfo
            SfcUtils.sleep(100).then(() => {
              showSuccessDialog(shareInfo)
            })
            return true
          } else {
            return Promise.reject(res.err)
          }
        } catch (err) {
          throw err
        }
      }
    })
  }

  
  /**
   * 显示分享成功对话框
   * @param shareInfo 创建分享后获取的分享信息
   */
  export function showSuccessDialog(shareInfo :ShareInfo) {
    const link = StringUtils.appendPath(location.origin, '#/s', shareInfo.id + '', shareInfo.verification || '')
    const successDialog = SfcUtils.openComponentDialog(FileShareSuccessVue, {
      props: {
        data: shareInfo
      },
      title: '分享成功',
      showConfirm: false,
      showCancel: false,
      footer: () => [
        h(VBtn, { color: 'primary', onClick: () => {SfcUtils.copyToClipboard(link); SfcUtils.snackbar('复制成功') } }, () => '复制链接'),
        h(VBtn, { color: 'primary', onClick: () => { successDialog.close() } }, () => '取消')
      ]
    })
  }
}