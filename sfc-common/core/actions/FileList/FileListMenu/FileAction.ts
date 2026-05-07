import DeleteConfirm from 'sfc-common/components/common/DeleteConfirm.vue'
import { FileListContext, IdType, MountPoint } from 'sfc-common/model'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { h, markRaw, ref } from 'vue'
import { MenuGroup, getContext } from 'sfc-common/core/context'
import { FileAttribute } from 'sfc-common/components'
import { MountPointService } from 'sfc-common/core/serivce/MountPointService'
import { FileExplorerContext } from 'sfc-common/components/common/FileExplorer/createListContext'
import MarkdownView from 'sfc-common/components/common/Markdown/MarkdownView.vue'
import { FileListMenuItem } from './type'
import type { FileAttributeSectionItem } from 'sfc-common/core/context/fileAttributeExtension'

const fileActionGroup: MenuGroup<FileListContext, FileListMenuItem> = 
{
  id: 'action',
  name: '文件操作',
  items: [
    {
      id: 'rename',
      title: '重命名',
      icon: 'mdi-form-textbox',
      renderOn(ctx) {
        return !ctx.readonly && ctx.selectFileList.length == 1
      },
      action(ctx) {
        const fileInfo = ctx.selectFileList[0]
        ctx.modelHandler.rename(fileInfo.name, fileInfo.md5).then(async ret => {
          if (ret) {
            ctx.modelHandler.refresh()
          }
        })
      }
    },
    {
      id: 'delete',
      title: '删除',
      icon: 'mdi-delete',
      renderOn(ctx) {
        return !ctx.readonly && ctx.selectFileList.length >= 1
      },
      action(ctx) {
        const asyncFunWrap = async() => {
          let isConfirm = false
          await SfcUtils.openComponentDialog(DeleteConfirm, {
            title: '删除文件',
            props: {
              fileList: ctx.selectFileList
            },
            onConfirm() {
              isConfirm = true
              return true
            }
          })
          if (isConfirm) {
            await SfcUtils.loadingDialogTask({ msg: '正在删除文件...' }, () => ctx.modelHandler.delete(ctx.selectFileList.map(file => file.name)))
            await ctx.modelHandler.refresh()
            SfcUtils.snackbar('删除成功')
          }
        }
        asyncFunWrap()
      }
    },
    {
      id: 'syncFileRecord',
      title: '同步存储记录',
      icon: 'mdi-sync',
      renderOn(ctx) {
        return ctx.selectFileList && ctx.selectFileList.length == 1 && ctx.selectFileList[0].mountId != null
      },
      async action(ctx) {
        await MountPointService.syncFileRecord(ctx.selectFileList[0].mountId)
      }
    },
    {
      id: 'previewInSide',
      title: '在侧边栏预览',
      icon: 'mdi-eye',
      renderOn(ctx) {
        return ctx instanceof FileExplorerContext
        && ctx.sideSupport.isEnabled
        && ctx.selectFileList.length == 1
        && ctx.selectFileList[0].dir == false && ctx.selectFileList[0].name.endsWith('.md')
      },
      async action(ctx) {
        const fctx = ctx as FileExplorerContext
        const url = ctx.getFileUrl(ctx.selectFileList[0])
        if (!url) {
          return
        }
        const md = (await SfcUtils.request({ url })).request.responseText as string
        fctx.sideSupport.setSide(MarkdownView, {
          resourceParams: ctx.getProtocolParams(),
          content: md
        }, ctx.selectFileList[0].name)
      },
    },
    {
      id: 'showAttr',
      title: '属性',
      icon: 'mdi-information',
      renderOn(ctx) {
        return ctx.selectFileList && ctx.selectFileList.length > 0
      },
      action(ctx) {
        const thumbnailUrl = ctx.selectFileList.length == 1 && !ctx.selectFileList[0].dir ? ctx.getThumbnailUrl(ctx.selectFileList[0]) : undefined

        // 收集扩展段
        const extensions = getContext().fileAttributeSections.value
        const extensionSections: FileAttributeSectionItem[] = extensions
          .map(ext => ({ id: ext.id, section: ext.resolve(ctx) }))
          .filter(item => item.section != null)
          .sort((a, b) => {
            const order: Record<string, number> = {}
            return (order[a.id] ?? 100) - (order[b.id] ?? 100)
          })
          .map(item => item.section!)

        extensionSections.forEach(s => {
          if (typeof s.component !== 'string') {
            s.component = markRaw(s.component)
          }
        })

        const props = {
          files: ctx.selectFileList,
          path: ctx.path,
          thumbnailUrl,
          extensionSections
        }
        // if (ctx instanceof FileExplorerContext && ctx.sideSupport.isEnabled && !useCheckIsMobile().value) {
        //   ctx.sideSupport.setSide(FileAttribute, props, '文件属性')
        //   return
        // } else {
        // }
        SfcUtils.openComponentDialog(FileAttribute, {
          title: '文件属性',
          props: props,
          showCancel: false,
          extraDialogOptions: {
            maxWidth: '720px'
          }
        })
      }
    }
  ]
}

export default fileActionGroup