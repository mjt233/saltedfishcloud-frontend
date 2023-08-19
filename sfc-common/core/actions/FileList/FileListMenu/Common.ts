import { VBtn } from 'vuetify/components'
import { SfcUtils } from 'sfc-common/utils/SfcUtils'
import { FileListContext } from 'sfc-common/model'
import { MenuGroup, MenuItem, context } from 'sfc-common/core/context'
import { ShareService } from 'sfc-common/core/serivce/ShareService'
import { CreateLinkForm } from 'sfc-common/components/'
import { h } from 'vue'

const commonGroup: MenuGroup<FileListContext> = {

  id: 'common',
  name: '通用功能',
  items: [
    // {
    //   id: 'open',
    //   title: '打开',
    //   action(ctx) {
    //     SfcUtils.openFile(ctx, ctx.selectFileList[0])
    //   },
    //   renderOn(ctx) {
    //     return ctx.selectFileList && ctx.selectFileList.length == 1 && !ctx.selectFileList[0].dir
    //   }
    // },
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
    },
    {
      id: 'open-as',
      title: '打开方式',
      icon: '',
      subItems: (ctx) => {
        const file = ctx.selectFileList[0]
        const items = context.fileOpenHandler.value.map(handler => {
          return {
            id: `open-as-${handler.id}`,
            title: handler.title,
            renderOn: () => handler.matcher(ctx, file),
            action(ctx) {
              handler.action(ctx, file)
            },
            icon: handler.icon
          } as MenuItem<FileListContext>
        })
        items.push({
          id: 'open-as-more',
          title: '更多',
          action(ctx) {
            SfcUtils.openFileOpenSelectorDialog(ctx, ctx.selectFileList[0], context.fileOpenHandler.value)
          }
        })
        return [
          {
            id: 'open-as-group',
            renderOn: () => true,
            name: '打开方式',
            items: items
          }
        ]
      },
      renderOn(ctx) {
        return ctx.selectFileList && ctx.selectFileList.length == 1 && !ctx.selectFileList[0].dir
      },
      action(ctx) {
        SfcUtils.openFileOpenSelectorDialog(ctx, ctx.selectFileList[0], context.fileOpenHandler.value)
      },
    }
  ]
}

export default commonGroup