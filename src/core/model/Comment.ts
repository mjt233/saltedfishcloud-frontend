import { AuditModel, IdType } from './Common'
/**
 * 评论信息表
 */
export interface Comment extends AuditModel {
  /**
   * 话题id
   */
  topicId: IdType

  /**
   * 回复id
   */
  replyId: IdType

  /**
   * 发送者ip地址
   */
  ip: string

  /**
   * 评论内容
   */
  content: string

  /**
   * 是否被删除
   */
  isDelete: number

  username?: string
}