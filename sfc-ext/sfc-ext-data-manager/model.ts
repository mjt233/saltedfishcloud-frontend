import type { IdType } from 'sfc-common/model'

/**
 * 失效数据记录状态枚举
 * - `PENDING`: 待处理，数据刚被检测出异常
 * - `PUBLISHED`: 已发布，管理员已将数据发布为可认领状态
 * - `CLAIMED`: 已认领，用户已认领该失效数据
 * - `COMPLETED`: 处理完成，数据已被修复或标记为处理完成
 */
export type InvalidDataRecordStatus = 'PENDING' | 'PUBLISHED' | 'CLAIMED' | 'COMPLETED'

/**
 * 文件类型识别结果详情
 */
export interface FileTypeCheckResultDetail {
  /** 文件可能的拓展名 */
  extension: string
  /** 文件的MIME类型 */
  mimetype: string
  /** 提取的元数据 */
  metadata: Record<string, string>
  /** 额外的提示信息 */
  message: string
}

/**
 * 失效数据记录
 * 表示一条存储系统中检测到的失效数据条目，包含文件元数据、存储信息及处理状态
 */
export interface InvalidDataRecord {
  /** 记录唯一标识 */
  id: IdType
  /** 记录创建时间（ISO 8601格式） */
  createAt: string
  /** 记录最后更新时间（ISO 8601格式） */
  updateAt: string
  /**
   * 失效数据类型
   * - `INVALID_FILE_RECORD`: 文件记录丢失，数据库中有记录但存储中无对应文件
   * - `INVALID_STORAGE`: 存储丢失，存储中有文件但数据库中无对应记录
   */
  type: 'INVALID_FILE_RECORD' | 'INVALID_STORAGE'
  /**
   * 文件存储模式
   * - `RAW`: 原始存储，文件按原始路径存储
   * - `UNIQUE`: 唯一存储，文件按MD5去重存储
   */
  storeMode: 'RAW' | 'UNIQUE'
  /** 文件在存储系统中的路径 */
  storagePath: string
  /** 文件所有者的用户ID */
  ownerUid: IdType
  /** 文件在磁盘上的物理路径，可能为null */
  diskPath: string | null
  /** 文件大小（字节） */
  fileSize: IdType
  /** 文件最后修改时间（ISO 8601格式） */
  lastModified: string
  /** 是否需要进行文件类型识别 */
  needIdentify: boolean
  /** 文件MIME类型，未经识别时可能为null */
  fileType: string | null
  /** 文件元数据JSON字符串，可能为null */
  metadata: string | null
  /** 记录当前处理状态 */
  status: InvalidDataRecordStatus
  /**
   * 处理方式
   * - `DISCARD`: 丢弃数据
   * - `AUTO_FIX`: 自动修复
   * - `CLAIM`: 用户认领
   * - `null`: 未指定处理方式
   */
  processMethod: 'DISCARD' | 'AUTO_FIX' | 'CLAIM' | null
  /** 文件MD5校验值 */
  md5: string

  /**
   * 类型检测结果json。该数据经过类型检测后会有值。
   * 反序列化后类型为 {@link FileTypeCheckResult}
   */
  typeCheckResult: string
}

/**
 * 文件类型识别结果
 */
export interface FileTypeCheckResult {
  /** 提供该结果的Provider的id */
  providerId: string
  /** 文件类型标识 */
  typeId: string
  /** 文件类型名称 */
  typeName: string
  /** 识别结果详情 */
  detail: FileTypeCheckResultDetail
}



/**
 * 认领参数
 * 用户认领失效数据时提交的参数
 */
export interface ClaimParam {
  /** 要认领的失效数据记录ID */
  invalidDataId: IdType
  /** 目标用户ID，认领后数据将归属该用户 */
  targetUid: IdType
  /** 认领后的文件名 */
  fileName: string
  /** 认领后的保存路径 */
  savePath: string
}

/**
 * 认领记录
 * 记录用户对失效数据的认领操作历史
 */
export interface ClaimRecord {
  /** 认领记录唯一标识 */
  id: IdType
  /** 认领操作时间（ISO 8601格式） */
  createAt: string
  /** 记录最后更新时间（ISO 8601格式） */
  updateAt: string
  /** 关联的失效数据记录ID */
  invalidDataId: IdType
  /** 认领目标用户ID */
  targetUid: IdType
  /** 认领后的文件名 */
  fileName: string
  /** 认领后的保存路径 */
  savePath: string
}

/**
 * 文件元数据定义
 */
export interface FileMetadataDefine {
  /** 元数据的人类阅读友好名称 */
  name: string
  /** 元数据的唯一标识符 */
  key: string
  /** 元数据的描述信息 */
  description: string
  /** 页面视图展示时使用的html标签或vue组件名称 */
  viewTag: string
}

/**
 * 文件类型识别器信息
 * 描述一个文件类型识别器的基本信息和支持的文件类型
 */
export interface FileTypeProviderInfo {
  /** 识别器唯一标识 */
  id: string
  /** 识别器处理的文件类型标识 */
  typeId: string
  /** 文件类型显示名称 */
  typeName: string
  /** 识别器支持的文件扩展名列表 */
  supportedFileExtensions: string[]
  /** 识别器可提取的文件元数据定义列表 */
  metadataDefines: FileMetadataDefine[]
}

/**
 * 失效数据查询参数
 * 用于查询失效数据列表时的筛选条件
 */
export interface InvalidDataQuery {
  /** 按状态筛选（支持多选） */
  status?: string[]
  /** 按所有者用户ID筛选 */
  ownerUid?: IdType
  /** 最小文件大小（字节） */
  minFileSize?: IdType
  /** 最大文件大小（字节） */
  maxFileSize?: IdType
  /** 按文件类型筛选（支持多选） */
  fileType?: string[]
  /** 页码（从0开始） */
  page?: IdType
  /** 每页记录数 */
  size?: IdType
}
