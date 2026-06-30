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
   * 发送者ip地址。如果为 null 则表示管理员未开启IP地址显示。
   * 可能包含遮掩字符*（管理员配置）
   */
  ip: string | null

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