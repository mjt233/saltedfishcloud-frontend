import { CommonRequest, IdType, Comment } from '@/core/model'
import { useJsonBody } from '@/utils/FormUtils/CommonFormUtils'

const comment = {
  prefix: '/comment',
  /**
   * 按话题id获取评论
   * @param topicId 话题id
   * @param page 页码，从0开始，默认0
   * @param size 每页大小，默认20
   */
  listByTopicId(topicId: IdType, page?: number, size?: number): CommonRequest<Comment[]> {
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
   * 发送系统留言
   * @param content 内容
   */
  sendAnonymousComment(content: string): CommonRequest {
    return useJsonBody({
      url: `${this.prefix}/sendAnonymousComment`,
      data: {
        content
      },
      method: 'post'
    })
  }
}

export default comment