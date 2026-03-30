import DeleteConfirm from 'sfc-common/components/common/DeleteConfirm.vue'
import { FileListContext, IdType, MountPoint } from 'sfc-common/model'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { h, ref } from 'vue'
import { MenuGroup } from 'sfc-common/core/context'
import { FileAttribute } from 'sfc-common/components'
import { VBtn } from 'vuetify/components'
import { CreateMountPointFormVue } from 'sfc-common/components/common/MountPoint'
import { MountPointService } from 'sfc-common/core/serivce/MountPointService'
import { FileExplorerContext } from 'sfc-common/components/common/FileExplorer/createListContext'
import MarkdownView from 'sfc-common/components/common/Markdown/MarkdownView.vue'

const fileActionGroup: MenuGroup<FileListContext> = 
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
            await ctx.modelHandler.delete(ctx.selectFileList.map(file => file.name))
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
        const doAction = () => {
          const mountPointRef = ref<MountPoint>()
          const closeBtn = h(VBtn, {color: 'primary', onClick: () => attrInst.close()}, () => '关闭')
          const editBtn = h(VBtn, {color: 'primary', onClick: () => editMountPoint()}, () => '编辑挂载参数')
          const editMountPoint = () => {
            attrInst.close()
            const mpInst = SfcUtils.openComponentDialog(CreateMountPointFormVue, {
              title: '修改挂载点',
              props: {
                initValue: mountPointRef.value
              },
              async onConfirm() {
                try {
                  const form = mpInst.getInstAsForm()
                  const mountPointFormData = form.getFormData() as MountPoint
                  const res = await form.submit()
                  if (!res.success) {
                    return false
                  }
                  doAction()
                  if (mountPointFormData.isProxyStoreRecord && mountPointRef.value && !mountPointRef.value.isProxyStoreRecord) {
                    await MountPointService.syncFileRecord(
                      mountPointFormData.id as IdType,
                      `挂载点 【${mountPointFormData.name}】 的委托存储记录功能已切换为开启，是否需要立即同步存储记录？`
                    )
                  }
                  return true
                } catch (err) {
                  return false
                }
              },
            })
          }
          const thumbnailUrl = ctx.selectFileList.length == 1 && !ctx.selectFileList[0].dir ? ctx.getThumbnailUrl(ctx.selectFileList[0]) : undefined
          const attrInst = SfcUtils.openComponentDialog(FileAttribute, {
            title: '文件属性',
            props: {
              files: ctx.selectFileList,
              path: ctx.path,
              thumbnailUrl,
              onMountPointLoaded(mountPoint: MountPoint) {
                mountPointRef.value = mountPoint
              }
            },
            showCancel: false,
            showConfirm: false,
            footer: () => mountPointRef.value ? [editBtn, closeBtn] : [closeBtn]
          })
        }
        doAction()
      }
    }
  ]
}

export default fileActionGroup