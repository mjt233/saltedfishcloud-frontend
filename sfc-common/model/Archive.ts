import { IdType, ResourceRequest } from './Common'

/**
 * 压缩引擎
 */
export interface ArchiveEngine {
  /**
   * 引擎id
   */
  engineId: string

  /**
   * 引擎名称
   */
  engineName: string

  /**
   * 支持压缩的文件类型（带点的后缀名，如.zip）
   */
  compressExtensions: string[]

  /**
   * 支持解压缩的文件类型（带点的后缀名，如.zip）
   */
  decompressExtensions: string[]
}


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

/**
 * 压缩/解压缩的加密选项
 */
export interface EncryptionParam {
  /**
   * 加密算法标识
   */
  algorithm: string,

  /**
   * 密码
   */
  password: string
}

/**
 * 压缩引擎属性
 */
export interface ArchiveEngineProperty {
  /**
   * 压缩级别，默认 'NORMAL'
   */
  compressionLevel?: 'STORE' | 'FASTEST' | 'FAST' | 'NORMAL' | 'HIGH' | 'ULTRA'

  /**
   * 加密参数，如果不需要加密则为null
   */
  encryptionParam?: EncryptionParam

  /**
   * 压缩文件文件名字符编码。未指定则使用系统编码
   */
  encoding?: string
}


/**
 * 创建文件在线压缩的异步任务
 */
export interface AsyncCompressParam {
  /**
   * 文件源用户id
   */
  sourceUid: IdType

  /**
   * 源目录路径
   */
  sourcePath: string

  /**
   * 源文件名（相对目录路径下的直接一级文件名）
   */
  sourceNames: string[]

  /**
   * 压缩文件输出到的用户id
   */
  targetUid: IdType

  /**
   * 输出文件的完整路径
   */
  targetFilePath: string

  /**
   * 压缩引擎提供者id
   */
  engineProviderId: string

  /**
   * 压缩引擎参数
   */
  engineProperty: ArchiveEngineProperty

  /**
   * 是否等待完成（最长只等待一个小时）
   */
  waitExit: boolean
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
