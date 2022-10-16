import { useJsonBody } from '@/utils/FormUtils/CommonFormUtils'
import { CommonRequest, MountPoint, DiskFileSystemDescribe } from '@/core/model'

const mountPoint = {
  prefix: 'mountPoint',
  listAvailableFileSystem(): CommonRequest<DiskFileSystemDescribe[]> {
    return {
      url: `${this.prefix}/listAvailableFileSystem`
    }
  },
  saveMountPoint(mountPoint: MountPoint) {
    return useJsonBody({
      url: `${this.prefix}/setMountPoint`,
      method: 'put',
      data: mountPoint
    })
  }
}
export default mountPoint