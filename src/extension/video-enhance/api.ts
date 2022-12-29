import { CommonRequest } from '@/core/model'
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
    return {
      url: '/video/encodeConvert',
      data: param,
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      } 
    }
  }
}