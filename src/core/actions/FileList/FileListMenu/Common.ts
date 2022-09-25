import { VBtn } from 'vuetify/components'
import { CommonForm } from '@/utils/FormUtils'
import { SfcUtils } from '@/utils/SfcUtils'
import { FileListContext } from '@/core/model'
import { MenuGroup } from '@/core/context'
import { ShareService } from '@/core/serivce/ShareService'
import { CreateLinkForm } from '@/components'
import { h } from 'vue'

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
    },
    {
      id: 'create-link',
      title: '生成链接',
      icon: 'mdi-link-variant',
      renderOn(ctx) {
        return ctx.selectFileList && ctx.selectFileList.length == 1 && !ctx.selectFileList[0].dir
      },
      action(ctx) {
        const inst = SfcUtils.openComponentDialog(CreateLinkForm, {
          props: {
            fileName: ctx.selectFileList[0].name,
            uid: ctx.uid,
            path: ctx.path,
            md5: ctx.selectFileList[0].md5
          },
          title: '生成下载直链',
          async onConfirm() {
            const submitResult = await inst.getInstAsForm().submit()
            if (submitResult.success) {
              const url = submitResult.data as any as string
              const inst2 = SfcUtils.openComponentDialog('a',{
                props: {
                  text: url,
                  class: 'link break-text',
                  target: '_blank',
                  href: url
                },
                title: '生成成功',
                showConfirm: false,
                showCancel: false,
                footer: () => [
                  h(VBtn, { color: 'primary', 'onClick': () => { SfcUtils.copyToClipboard(url); SfcUtils.snackbar('复制成功')} } ,() => '复制'),
                  h(VBtn, { color: 'primary', 'onClick': () => { inst2.close() } } ,() => '取消')
                ]
              })
              return true   
            } else {
              return false
            }
          }
        })
      }
    }
  ]
}

export default commonGroup