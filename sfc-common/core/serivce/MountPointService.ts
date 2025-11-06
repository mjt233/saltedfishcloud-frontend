import API from 'sfc-common/api'
import MountPointSyncFileRecordForm from 'sfc-common/components/form/MountPointSyncFileRecordForm.vue'
import { IdType } from 'sfc-common/model'
import SfcUtils from 'sfc-common/utils/SfcUtils'

export namespace MountPointService {
  /**
   * 同步挂载点的文件存储记录
   * @param id 挂载点id
   * @param message 提示语
   */
  export async function syncFileRecord(id: IdType, message?: string):Promise<void> {
    const ld = SfcUtils.loadingDialog({msg: '加载中'})
    let mp
    try {
      mp = (await SfcUtils.request(API.mountPoint.getById(id))).data.data
      if (!mp.isProxyStoreRecord) {
        return Promise.reject('该挂载点未开启委托存储记录功能，无需同步')
      }
    } finally {
      ld.close()
    }
    await SfcUtils.sleep(100)

    let isSuccess = false
    return new Promise((resolve, reject) => {
      const syncDialog = SfcUtils.openComponentDialog(MountPointSyncFileRecordForm, {
        props: {
          id: mp.id,
          message
        },
        extraDialogOptions: {
          maxWidth: '480px'
        },
        title: '同步存储记录',
        persistent: true,
        async onConfirm() {
          const syncForm = syncDialog.getInstAsForm()
          const loadingDialog = SfcUtils.loadingDialog({ msg: '正在同步' })
          try {
            const syncRes = await syncForm.submit()
            if (!syncRes.success) {
              return false
            }
            SfcUtils.alert('同步成功')
            isSuccess = true
            resolve()
            return true
          } finally {
            loadingDialog.close()
          }
        },
        onCancel() {
          if (!isSuccess) {
            reject('cancel')
          }
          return true
        },
        
      })
    })
  }
}