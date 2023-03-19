import { ApiRequest, CommonRequest,IdType } from 'sfc-common'
import { QuickShare, QuickShareParams } from './model'

const quickShare = {
  prefix: '/quickShare',
  feature: {
    isEnable: 'quickshare.is-enable',
    maxSize: 'quickshare.max-size',
    effectiveDuration: 'quickshare.effective-duration'
  },
  /**
   * 上传文件分享
   * @param file 文件
   * @param param 参数
   */
  upload(file: File, param: QuickShareParams): CommonRequest<string> {
    const fd = new FormData()
    fd.set('file', file)
    return {
      url: `${this.prefix}/upload`,
      params: param,
      data: fd,
      method: 'post'
    }
  },
  /**
   * 根据提取码获取快速分享的基础信息
   * @param code 提取码
   */
  getByCode(code: string): CommonRequest<QuickShare> {
    return {
      url: `${this.prefix}/getByCode`,
      params: { code: code }
    }
  },
  /**
   * 获取快速分享的文件内容
   * @param id 快速分享id
   */
  getShareFile(id: IdType): ApiRequest<Blob> {
    return {
      url: `${this.prefix}/getShareFile?id=${id}`
    }
  }
}

export default quickShare