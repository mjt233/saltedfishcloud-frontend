import { CommonRequest } from '@/core/model'
import { useJsonBody } from '@/utils/FormUtils/CommonFormUtils'
import { EncodeConvertTaskParam, FFMpegInfo } from './model'

export namespace VEAPI {
  export function getFFMpegInfo(): CommonRequest<FFMpegInfo> {
    return {
      url: '/video/getFFMpegInfo'
    }
  }

  /**
   * 提交视频编码转换参数
   * @param param 任务参数
   */
  export function encodeConvert(param: EncodeConvertTaskParam): CommonRequest<string> {
    return useJsonBody({
      url: '/video/encodeConvert',
      data: param,
      method: 'post'
    })
  }
}