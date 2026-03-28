import { CommonPageInfo, CommonRequest, IdType, PageInfo, PageRequest, ResourceRequest } from 'sfc-common/model'
import { EncodeConvertTask, EncodeConvertTaskLog, EncodeConvertTaskParam, FFMpegInfo, VideoInfo } from './model'
import { useJsonBody } from 'sfc-common/utils/FormUtils'

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

  /**
   * 检查插件是否配置正确
   */
  export function check() {
    return {
      url: '/video/check'
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

  /**
   * 记录视频观看时长
   * @param uid 观看的用户id
   * @param identify 视频标识
   * @param time 观看时长
   */
  export function recordWatchProgress(uid: IdType, identify: string, time: number): CommonRequest {
    return {
      url: '/video/recordWatchProgress',
      params: {
        uid, identify, time
      },
      method: 'post'
    }
  }

  /**
   * 获取视频观看时长
   * @param uid 观看的用户id
   * @param identify 视频标识
   */
  export function getWatchProgress(uid: IdType, identify: string): CommonRequest<number | undefined> {
    return {
      url: '/video/getWatchProgress',
      params: {
        uid, identify
      }
    }
  }

  /**
   * 获取视频编码详细信息
   * @param resourceRequest 视频的统一资源请求参数
   */
  export function getVideoInfo(resourceRequest: ResourceRequest): CommonRequest<VideoInfo> {
    return {
      url: '/video/getVideoInfo',
      params: resourceRequest,
    }
  }

  /**
   * 获取字幕资源
   * @param resourceRequest 视频的统一资源请求参数
   * @param stream 字幕的流编号
   * @param type 字幕类型，默认使用webvtt
   */
  export function getSubtitle(resourceRequest: ResourceRequest, stream: string | number, type?: string) {
    return {
      url: '/video/getSubtitle',
      params: {
        ...resourceRequest,
        stream,
        type: type || 'webvtt'
      }
    }
  }
}