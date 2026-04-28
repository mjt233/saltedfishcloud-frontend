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
   * 指定引擎使用哪种压缩/解压缩格式，如不指定则由引擎根据文件名自动识别
   */
  extension?: string

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
   * 解压引擎id
   */
  engineProviderId: string

  /**
   * 解压引擎的详细解压参数（编码、密码、扩展名等）
   */
  archiveEngineProperty: ArchiveEngineProperty

  /**
   * 解压到的个人网盘用户id
   */
  uid: IdType

  /**
   * 解压到的个人网盘路径
   */
  path: string
}

/**
 * 压缩任务资源，既可表示待压缩资源，也可表示压缩包内资源
 */
export interface ArchiveResource {
  /**
   * 文件名（不含路径）
   */
  name: string

  /**
   * 文件大小，单位字节
   */
  size: number

  /**
   * 资源在压缩包内的完整路径。规范如下：
   * - 不使用'/'开头
   * - 使用'/'作为分隔符
   * - 长度 > 1 且 使用'/'作为末尾字符表示目录
   */
  archivePath: string

  /**
   * 是否为目录
   */
  isDirectory: boolean

  /**
   * 最后修改时间
   */
  lastModified?: Date

  /**
   * 创建时间
   */
  created?: Date
}

/**
 * 读取压缩包内所有文件列表的请求参数
 */
export interface ListArchiveResourcesRequest {
  /**
   * 使用的压缩引擎id
   */
  engineProviderId: string

  /**
   * 压缩引擎参数
   */
  engineProperty: ArchiveEngineProperty

  /**
   * 要查看的压缩包资源
   */
  resourceRequest: ResourceRequest
}
