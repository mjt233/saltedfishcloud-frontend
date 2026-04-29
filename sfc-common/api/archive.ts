import { CommonRequest, IdType, ResourceRequest } from 'sfc-common/model'
import { ArchiveResource, AsyncArchiveExtractParam, AsyncCompressParam, ListArchiveResourcesRequest } from 'sfc-common/model/Archive'
import { useJsonBody } from 'sfc-common/utils/FormUtils/CommonFormUtils'

export const archive = {
  prefix: '/archive',
  /**
   * 创建一个解压缩异步任务
   */
  asyncExtract(param: AsyncArchiveExtractParam): CommonRequest<IdType> {
    return useJsonBody({
      url: `${this.prefix}/asyncExtract`,
      method: 'POST',
      data: param,
    })
  },
  /**
   * 创建一个异步压缩任务
   * @param param 压缩任务参数
   */
  asyncCompress(param: AsyncCompressParam): CommonRequest<IdType> {
    return useJsonBody({
      url: `${this.prefix}/asyncCompress`,
      method: 'POST',
      data: param,
    })
  },
  /**
   * 读取压缩包内资源列表
   * @param param 查询参数
   */
  listResources(param: ListArchiveResourcesRequest): CommonRequest<ArchiveResource[]> {
    return useJsonBody({
      url: `${this.prefix}/listResources`,
      method: 'POST',
      data: param,
    })
  }
}