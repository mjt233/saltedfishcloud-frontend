import { BgOption } from 'sfc-common'
import { ArchiveEngine } from './Archive'

/**
 * 系统支持的特性
 */
export interface SystemFeature {

  /**
   * 系统支持的压缩引擎列表
   */
  archiveEngineList: ArchiveEngine[]

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
   * 是否默认为黑暗主题
   */
  darkTheme: boolean

  /**
   * 网盘文件上传是否使用通用资源请求接口/api/file/upload
   */
  isUseCommonUpload: boolean

  /**
   * 其他的拓展类型
   */
  [otherKey: string]: any
}