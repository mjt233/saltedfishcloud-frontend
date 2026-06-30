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
   * 根评论ID。回复的 replyId 始终指向话题下的根评论ID；
   * 话题下的评论（非回复）的 replyId 为 null。
   */
  replyId: IdType

  /**
   * 被回复人的用户ID（仅回复有效，根评论为 null）
   */
  replyUid?: IdType | null

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

  /**
   * 根评论的回复数量（仅 listByTopicId 查询根评论时有值）
   */
  replyCount?: number

  /**
   * 被回复人用户名（仅回复有值，通过 replyUid 解析）
   */
  replyUsername?: string
}
