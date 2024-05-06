import DeleteConfirm from 'sfc-common/components/common/DeleteConfirm.vue'
import { FileListContext, MountPoint } from 'sfc-common/model'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { h, ref } from 'vue'
import { MenuGroup } from 'sfc-common/core/context'
import { FileAttribute } from 'sfc-common/components'
import { VBtn } from 'vuetify/components'
import API from 'sfc-common/api'
import { CreateMountPointFormVue } from 'sfc-common/components/common/MountPoint'

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
          await SfcUtils.confirm('', '', {
            children: [ h(DeleteConfirm, { fileList: ctx.selectFileList }) ],
            cancelToReject: true
          })
          await ctx.modelHandler.delete(ctx.selectFileList.map(file => file.name))
          await ctx.modelHandler.refresh()
          SfcUtils.snackbar('删除成功')
        }
        asyncFunWrap()
      }
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
                  const res = await mpInst.getInstAsForm().submit()
                  if (!res.success) {
                    return false
                  }
                  doAction()
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