import CreateMountPointFormVue from 'sfc-common/components/common/MountPoint/CreateMountPointForm.vue'
import { MenuGroup } from 'sfc-common/core/context'
import { MountPointService } from 'sfc-common/core/serivce/MountPointService'
import { FileListContext, IdType, MountPoint } from 'sfc-common/model'
import SfcUtils from 'sfc-common/utils/SfcUtils'

export const mountMenuGroup = {
  id: 'mount',
  name: '挂载',
  items: [

    {
      id: 'mount',
      title: '云挂载目录',
      icon: 'mdi-cloud',
      renderOn(ctx) {
        return !ctx.readonly
      },
      action(ctx) {
        const form = SfcUtils.openComponentDialog(CreateMountPointFormVue, {
          title: '创建挂载点',
          props: {
            uid: ctx.uid,
            path: ctx.path
          },
          persistent: true,
          async onConfirm() {
            const res = await form.getInstAsForm().submit()
            if(res.success) {
              const refreshPromise = ctx.modelHandler.refresh()
              const mp = form.getInstAsForm().getFormData() as MountPoint
              if (mp.isProxyStoreRecord) {
                (async() => {
                  try {
                    try {
                      SfcUtils.beginLoading()
                      await SfcUtils.sleep(200)
                      await refreshPromise
                    } finally {
                      SfcUtils.closeLoading()
                    }
                    await MountPointService.syncFileRecord(ctx.fileList.find(e => e.name == mp.name)?.mountId as IdType, '新增的挂载点开启了委托存储记录，是否需要立即同步存储记录？')
                  } catch (err) {
                    if (err != 'cancel') {
                      SfcUtils.snackbar(err)
                    }
                  }
                })()
              }
              return true
            } else {
              return false
            }
          }
        })
      },
    }
  ]
} as MenuGroup<FileListContext>