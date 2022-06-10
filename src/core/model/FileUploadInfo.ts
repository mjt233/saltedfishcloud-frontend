
import { Prog } from '@/utils/FileUtils/FileDataProcess'

export type FileUploadStatus = 'wait' | 'digest' | 'request' | 'upload' | 'success' | 'failed' | 'pause'
export interface FileUploadInfo {
  /**
   * 上传的文件
   */
  file: File,

  /**
   * 处理进度
   */
  prog: Prog,

  /**
   * 上传处理进度
   */
  status: FileUploadStatus

}