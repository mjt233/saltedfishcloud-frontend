import { EncodeConvertFormData, EncodeConvertRule, VideoInfo } from './../model'
import { type FileListContext, type FileInfo, type ResourceRequest, StringUtils } from 'sfc-common'
import { VEAPI } from '../api'

const videoType = new Set(['mp4', 'mkv', 'avi', 'rm', 'rmvb', 'm4v', 'flv', 'mpg', 'mpeg', 'mpe', 'ts', 'mov', 'wmv'])

/**
 * 获取视频资源的统一资源获取参数 
 */
export function getVideoResourceParams(ctx: FileListContext, file: FileInfo, path: string) {
  return {
    ...ctx.getProtocolParams(),
    name: file.name,
    path
  }
}

/**
 * 获取视频信息 
 * @param ctx 文件列表上下文
 * @param file 待获取视频信息的视频文件
 * @param path 视频文件所在列表中的路径
 */
export async function getVideoInfo(ctx: FileListContext, file: FileInfo, path: string): Promise<VideoInfo> {
  const res = await window.SfcUtils.request(VEAPI.getVideoInfo(getVideoResourceParams(ctx, file, path)))
  return res.data.data
}


/**
 * 获取字幕URL
 * @param ctx 文件列表上下文
 * @param file 要获取字幕的文件信息
 * @param path 文件所在路径
 * @param streamIndex 字幕流索引
 */
export function getSubtitleUrl(ctx: FileListContext, file: FileInfo, path: string, streamIndex: string | number) {
  return window.SfcUtils.getApiUrl(VEAPI.getSubtitle({
    ...ctx.getProtocolParams(),
    name: file.name,
    path: path
  }, streamIndex))
}

/**
 * 判断是否为视频文件名
 * @param filename 文件名
 */
export function isVideo(filename: string) {
  const extName = filename.split('.').pop()
  return !!extName && videoType.has(extName)
}

/**
 * 生成转换任务参数
 * @param ctx 文件列表上下文
 * @param formData 视频转码表单原始参数
 * @param file 待转码的文件
 * @param savePath 转码后的文件保存路径
 */
export async function generateConvertTaskParams(ctx: FileListContext, formData: EncodeConvertFormData, file: FileInfo, savePath: string) {
  const rules = formData.enabledConvertRules
  const source = getVideoResourceParams(ctx, file, file.path as string)
  const target = getVideoResourceParams(ctx, file, savePath)
  target.name = formData.fileName
  rules.filter(r => r.type == 'video').forEach(r => {
    r.crf = formData.crf
    r.preset = formData.preset
    r.tune = formData.tune
  })

  return VEAPI.encodeConvert({
    source,
    target,
    encodeConvertParam: {
      rules,
      format: formData.format
    },
    isOverwrite: formData.isOverwrite
  })
}