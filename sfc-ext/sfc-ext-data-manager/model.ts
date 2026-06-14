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

export interface InvalidDataRecord {
  id: number
  createAt: string
  updateAt: string
  type: 'INVALID_FILE_RECORD' | 'INVALID_STORAGE'
  storeMode: 'RAW' | 'UNIQUE'
  storagePath: string
  ownerUid: number
  diskPath: string | null
  fileSize: number
  lastModified: string
  needIdentify: boolean
  fileType: string | null
  metadata: string | null
  status: InvalidDataRecordStatus
  processMethod: 'DISCARD' | 'AUTO_FIX' | 'CLAIM' | null
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



export interface ClaimParam {
  invalidDataId: number
  targetUid: number
  fileName: string
  savePath: string
}

export interface ClaimRecord {
  id: number
  createAt: string
  updateAt: string
  invalidDataId: number
  targetUid: number
  fileName: string
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

export interface FileTypeProviderInfo {
  id: string
  typeId: string
  typeName: string
  supportedFileExtensions: string[]
  metadataDefines: FileMetadataDefine[]
}

export interface InvalidDataQuery {
  status?: string
  ownerUid?: number
  minFileSize?: number
  maxFileSize?: number
  fileType?: string
  page?: number
  size?: number
}
