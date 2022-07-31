import { useJsonBody } from '@/utils/FormUtils/CommonFormUtils'
import { CommonRequest, IdType } from '@/core/model'
export type WrapSource = 'file' | 'share'

export interface WrapParam {
  /** 文件所在的目录路径 */
  path: string

  /** 待打包的文件列表 */
  filenames: string[]

  /** 打包的资源所在数据区域类型，目前可选share，file，后续此处将拓展 */
  source: WrapSource

  /** 数据区域来源资源标识id。share下为分享id，file下为用户id，其他拓展类型以拓展数据id为准。 */
  sourceId: IdType

  /** 其他数据，根据不同的资源数据区域类型，可能需要不同的参数。比如share类型需要在otherData中传入vid和extractCode */
  otherData?: { [otherKey: string]: any }
}

const wrap = {
  prefix: '/wrap',
  /**
   * 创建多文件打包下载
   * @param param 打包参数
   */
  createWrap(param: WrapParam): CommonRequest<string> {
    return useJsonBody({
      method: 'post',
      url: `${this.prefix}/create`,
      data: param
    })
  },
  /**
   * 下载打包内容
   * @param wid 打包id
   * @param alias 响应文件名重命名
   */
  downloadWrap(wid: string, alias?: string) {
    return {
      url: `${this.prefix}/${wid}${alias ? '/' + alias : ''}`
    }
  }
}

export default wrap