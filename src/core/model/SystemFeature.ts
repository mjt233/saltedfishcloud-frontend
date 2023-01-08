import { BgOption } from '../context'

/**
 * 系统支持的特性
 */
export interface SystemFeature {
  /**
   * 压缩和解压缩时采用的文件编码格式，一般是gbk或utf-8
   */
  archiveEncoding: string

  /**
   * 支持的文件压缩类型，默认为['zip']
   */
  archiveType: string[]

  /**
   * 断点续传url
   */
  breakpointUrl: string

  /**
   * 是否开放邮箱注册
   */
  enableEmailReg: boolean

  /**
   * 是否开放注册码注册
   */
  enableRegCode: boolean

  /**
   * 支持的解压缩文件类型
   */
  extractArchiveType: string[]

  /**
   * 支持显示缩略图的格式
   */
  thumbType: string[]

  /**
   * 后端系统版本号
   */
  version: string,

  /**
   * 主背景图配置
   */
  bgMain?: BgOption

  /**
   * 其他的拓展类型
   */
  [otherKey: string]: any
}