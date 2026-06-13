export type InvalidDataRecordStatus = 'PENDING' | 'PUBLISHED' | 'CLAIMED' | 'COMPLETED'

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

export interface FileTypeProviderInfo {
  id: string
  typeId: string
  typeName: string
  supportedFileExtensions: string[]
  metadataDefines: any[]
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
