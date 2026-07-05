import { useJsonBody } from 'sfc-common/utils/FormUtils/CommonFormUtils'
import { CommonRequest, MountPoint, StorageMetadata, IdType, MountPointSyncFileRecordParam } from 'sfc-common/model'

const mountPoint = {
  prefix: 'mountPoint',
  listAvailableStorage(): CommonRequest<StorageMetadata[]> {
    return {
      url: `${this.prefix}/listAvailableStorage`
    }
  },
  saveMountPoint(mountPoint: MountPoint) {
    return useJsonBody({
      url: `${this.prefix}/setMountPoint`,
      method: 'put',
      data: mountPoint
    })
  },
  getById(id: IdType): CommonRequest<MountPoint> {
    return {
      url: `${this.prefix}/getById`,
      params: {
        id
      }
    }
  },
  /**
   * 同步挂载点的文件信息到文件记录服务
   * @param param 同步参数
   */
  syncFileRecord(param: MountPointSyncFileRecordParam) {
    return useJsonBody({
      url: `${this.prefix}/syncFileRecord`,
      data: param,
      method: 'post'
    })
  }
}
export default mountPoint