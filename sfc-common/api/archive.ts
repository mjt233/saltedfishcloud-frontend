import { CommonRequest, IdType, ResourceRequest } from 'sfc-common/model'
import { useJsonBody } from 'sfc-common/utils/FormUtils/CommonFormUtils'

export interface ArchiveParam {
  /**
   * 压缩格式类型，如：zip
   */
  type: string

  /**
   * 压缩文件的文件名编码，如utf8
   */
  encoding: string

  /**
   * 压缩/解压密码
   */
  password?: string

  otherParams?: Record<string, any>
}

export interface AsyncArchiveExtractParam {

  /**
   * 待解压的文件来源资源请求
   */
  source: ResourceRequest

  /**
   * 解压缩参数
   */
  archiveParam: ArchiveParam

  /**
   * 解压到的个人网盘用户id
   */
  uid: IdType

  /**
   * 解压到的个人网盘路径
   */
  path: string
}

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
  }
}