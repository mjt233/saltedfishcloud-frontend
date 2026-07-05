import { AuditModel, IdType } from './Common'

/**
 * 评论发送参数
 */
export interface SendCommentParam {
  /**
   * 评论内容
   */
  content: string

  /**
   * 话题id
   */
  topicId: IdType

  /**
   * 回复的根评论ID（为空则表示顶级评论）
   */
  replyId?: IdType

  /**
   * 被回复人的用户ID。<br>
   * 对评论的回复发送回复消息时，表示该条回复具体是回复哪个回复消息的发送人。<br>
   * 为空时表示直接回复根评论（而非回复某条回复消息）。
   */
  atUid?: IdType
}

/**
 * 评论信息（对应后端 PO Comment）
 */
export interface Comment extends AuditModel {
  /**
   * 评论主题id / 关联的业务主题id。<br>
   * 为null表示公共留言板。
   */
  topicId: IdType | null

  /**
   * 根评论ID。<br>
   * 回复层级最深为2层：话题(topicId) -> 话题下的评论 -> 对该评论的回复。<br>
   * 对于回复，replyId 始终指向话题下的根评论ID（而非直接被回复的那条），
   * 以便能按根评论ID一次查询出该评论下的所有回复。<br>
   * 对于话题下的评论（非回复），replyId 为 null。
   */
  replyId: IdType | null

  /**
   * 被回复人的用户ID。<br>
   * 仅对回复有效（replyId 不为 null 时），表示该条回复是回复哪个用户的。<br>
   * 对于话题下的根评论，replyUid 为 null。
   */
  replyUid: IdType | null

  /**
   * 被回复的回复消息发送人用户ID。<br>
   * 对根评论的回复进行回复时，表示该条回复具体是回复哪条回复消息的发送人。<br>
   * 直接回复根评论时该字段为 null。
   */
  atUid: IdType | null

  /**
   * 评论发送人ip地址
   */
  ip: string | null

  /**
   * 评论内容
   */
  content: string

  /**
   * 是否逻辑删除（0-未删除，1-已删除）
   */
  isDelete: number
}

/**
 * 评论视图对象（对应后端 CommentVo），包含评论的展示层信息。
 */
export interface CommentVo extends AuditModel {
  /**
   * 话题id。<br>
   * 为null表示公共留言板。
   */
  topicId: IdType | null

  /**
   * 根评论ID。<br>
   * 回复的 replyId 始终指向话题下的根评论ID；
   * 话题下的评论（非回复）的 replyId 为 null。
   */
  replyId: IdType | null

  /**
   * 被回复人的用户ID（仅回复有效，根评论为 null）
   */
  replyUid: IdType | null

  /**
   * 被回复的回复消息发送人用户ID。<br>
   * 对根评论的回复进行回复时，表示该条回复具体是回复哪条回复消息的发送人。<br>
   * 直接回复根评论时该字段为 null。
   */
  atUid: IdType | null

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
   * 是否逻辑删除（0-未删除，1-已删除）
   */
  isDelete: number

  /**
   * 发送者用户名
   */
  username: string

  /**
   * 根评论的回复数量（仅 listByTopicId 查询根评论时有值）
   */
  replyCount?: number

  /**
   * 被回复评论的发送者用户名（仅 listByCommentId 查询回复时有值，通过 replyUid JOIN user 解析）
   */
  replyUsername: string | null

  /**
   * 被回复的回复消息发送人用户名（仅 listByCommentId 查询回复时有值，通过 atUid JOIN user 解析）<br>
   * 直接回复根评论时该字段为 null。
   */
  atUsername: string | null
}
