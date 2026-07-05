import { CommonRequest, IdType, CommentVo, CommonPageInfo, SendCommentParam } from 'sfc-common/model'
import { useJsonBody } from 'sfc-common/utils/FormUtils/CommonFormUtils'

const comment = {
  prefix: '/comment',
  /**
   * 按话题id获取评论
   * @param topicId 话题id
   * @param page 页码，从0开始，默认0
   * @param size 每页大小，默认20
   */
  listByTopicId(topicId: IdType, page?: number, size?: number): CommonRequest<CommonPageInfo<CommentVo>> {
    return {
      url: `${this.prefix}/listByTopicId`,
      params: {
        topicId,
        page: page || 0,
        size: size || 20
      }
    }
  },
  /**
   * 按根评论id分页查询回复
   * @param commentId 根评论id
   * @param page 页码，从0开始，默认0
   * @param size 每页大小，默认10
   */
  listByCommentId(commentId: IdType, page?: number, size?: number): CommonRequest<CommonPageInfo<CommentVo>> {
    return {
      url: `${this.prefix}/listByCommentId`,
      params: {
        commentId,
        page: page || 0,
        size: size || 10
      }
    }
  },
  /**
   * 发送公共留言
   * @param content 内容
   * @param replyId 回复的评论id（可选）
   */
  sendPublicComment(param: SendCommentParam): CommonRequest {
    return useJsonBody({
      url: `${this.prefix}/sendPublicComment`,
      data: param,
      method: 'post'
    })
  },
  /**
   * 发送评论
   * @param topicId 话题id
   * @param content 评论内容
   * @param replyId 回复的消息id
   */
  sendComment(param: SendCommentParam): CommonRequest {
    return useJsonBody({
      url: `${this.prefix}/sendComment`,
      data: param
    })
  }
}

export default comment
