import { AuditModel } from 'sfc-common'

export interface QuickShareParams {
  /**
   * 提取码
   */
  code: string

  /**
   * 留言
   */
  message?: string
}

export interface QuickShare extends AuditModel,QuickShareParams {
  fileName: string

  size: string

  expiredAt: string
}