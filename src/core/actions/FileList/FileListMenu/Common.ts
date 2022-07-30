import { VBtn } from 'vuetify/components'
import { ShareInfo } from '@/api/share'
import { CommonForm } from '@/utils/FormUtils'
import { FileListContext } from '@/core/model'
import { MenuGroup } from '@/core/context'
import SfcUtils from '@/utils/SfcUtils'
import FileShareCreateFormVue from '@/components/common/FileShare/Form/FileShareCreateForm.vue'
import FileShareSuccessVue from '@/components/common/FileShare/FileShareSuccess.vue'
import { h } from 'vue'
import { StringUtils } from '@/utils/StringUtils'

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
        const createDialog = SfcUtils.openComponentDialog(FileShareCreateFormVue, {
          props: {
            uid: ctx.uid,
            path: ctx.path,
            name: ctx.selectFileList[0].name
          },
          title: '创建分享：' + ctx.selectFileList[0].name,
          async onConfirm() {
            try {
              const res = await (createDialog.getComponentInstRef() as any as CommonForm).submit()
              if (res.success) {
                const shareInfo = res.data?.data.data as ShareInfo
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
                return true
              } else {
                return Promise.reject(res.err)
              }
            } catch (err) {
              throw err
            }
          }
        })
      },
      renderOn(ctx) {
        return ctx.uid != 0 && !ctx.readonly && ctx.selectFileList && ctx.selectFileList.length == 1
      }
    }
  ]
}

export default commonGroup