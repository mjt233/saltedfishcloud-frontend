import { CommonPageInfo, CommonRequest, IdType, PageInfo, PageRequest } from 'sfc-common/model'
import { EncodeConvertTask, EncodeConvertTaskLog, EncodeConvertTaskParam, FFMpegInfo } from './model'

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

  /**
   * 获取视频编码转换任务列表
   * @param uid 用户id
   * @param status 任务状态，0 - 等待中，1 - 运行中，2 - 完成，3 - 失败
   * @param page 页码，首页为0
   * @param pageSize 每页大小
   */
  export function listConvertTask(uid: IdType, status: number, page: number, pageSize: number): CommonRequest<CommonPageInfo<EncodeConvertTask>> {
    return {
      url: '/video/listConvertTask',
      params: {
        uid,
        status,
        page,
        pageSize
      }
    }
  }

  /**
   * 获取视频编码转换任务列表
   * @param taskId 视频转换任务的id（不是异步任务id）
   */
  export function getLog(taskId: IdType): CommonRequest<EncodeConvertTaskLog> {
    return {
      url: '/video/getLog',
      params: { taskId }
    }
  }
}