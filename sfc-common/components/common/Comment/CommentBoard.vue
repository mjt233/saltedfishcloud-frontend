<template>
  <div>
    <LoadingMask :loading="loading" />
    <div class="message-area">
      <div v-for="comment in commentList" :key="comment.id" class="comment-item">
        <CommentMessage :comment="comment" @reply="handleReply" />
        <!-- 回复区域 -->
        <div v-if="comment.replyCount && comment.replyCount > 0" class="replies-area">
          <!-- 未展开：显示提示 -->
          <a v-if="!getReplyState(comment.id)?.expanded" class="reply-toggle" @click="loadReplies(comment, 0)">
            共{{ comment.replyCount }}条回复, 点击查看
          </a>
          <!-- 已展开 -->
          <template v-else>
            <!-- 加载中 -->
            <div v-if="getReplyState(comment.id)?.loading" class="text-center pa-2">
              <VProgressCircular indeterminate size="24" width="2" />
            </div>
            <!-- 回复列表 + 分页 -->
            <template v-else>
              <CommentMessage
                v-for="reply in getReplyState(comment.id)?.replies ?? []"
                :key="reply.id"
                :comment="reply"
                @reply="handleReply"
              />
              <!-- 有多页时显示分页栏 -->
              <div v-if="(getReplyState(comment.id)?.totalPage ?? 0) > 1" class="reply-pagination">
                <span class="page-info">共{{ getReplyState(comment.id)?.totalPage }}页</span>
                <a v-if="(getReplyState(comment.id)?.currentPage ?? 0) > 0" class="page-link" @click="loadReplies(comment, (getReplyState(comment.id)?.currentPage ?? 0) - 1)">上一页</a>
                <a
                  v-for="p in getVisiblePages(getReplyState(comment.id))"
                  :key="p"
                  class="page-link"
                  :class="{ 'page-active': p === (getReplyState(comment.id)?.currentPage ?? 0) }"
                  @click="loadReplies(comment, p)"
                >{{ p + 1 }}</a>
                <a v-if="(getReplyState(comment.id)?.currentPage ?? 0) < (getReplyState(comment.id)?.totalPage ?? 0) - 1" class="page-link" @click="loadReplies(comment, (getReplyState(comment.id)?.currentPage ?? 0) + 1)">下一页</a>
                <a class="page-link collapse-link" @click="collapseReplies(comment)">收起</a>
              </div>
              <!-- 仅一页时只显示收起 -->
              <a v-else class="reply-toggle" @click="collapseReplies(comment)">收起</a>
            </template>
          </template>
        </div>
      </div>
    </div>
    <div ref="sendArea">
      <div v-if="replyTo" class="reply-indicator">
        回复 @{{ replyTo.username || '[游客]' }}
        <a class="cancel-reply" @click="cancelReply">取消</a>
      </div>
      <div class="d-flex align-end" style="min-height: 32px">
        <SimpleTextarea
          v-model="content"
          style="min-height: 32px"
          placeholder="友善留言，Ctrl+Enter发送哦~"
          @keyup="keyupHandler"
        />
        <div>
          <VBtn
            style="margin: 0 6px"
            icon="mdi-send"
            flat
            @click="actions.send"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 回复区域的状态信息 */
interface ReplyState {
  /** 是否已展开 */
  expanded: boolean
  /** 回复列表 */
  replies: Comment[]
  /** 当前页码（0-based） */
  currentPage: number
  /** 总页数 */
  totalPage: number
  /** 回复总数 */
  totalCount: number
  /** 是否正在加载 */
  loading: boolean
}

/** 每页回复数量 */
const REPLY_PAGE_SIZE = 10

const sendArea = ref() as Ref<HTMLElement>
const props = defineProps({
  /** 话题ID */
  topicId: {
    type: [String, Number] as PropType<IdType>,
    default: 0
  },
  /** 初始页码 */
  initPage: {
    type: Number,
    default: 0
  },
  /** 是否允许发送 */
  canSend: {
    type: Boolean,
    default: false
  },
  /** 消息区域最大高度 */
  maxMessageHeight: {
    type: String,
    default: '480px'
  }
})
const loadingManager = new LoadingManager()
const content = ref('')
const loading = loadingManager.getLoadingRef()
const replyTo = ref<Comment | null>(null)

/** 每条根评论的回复状态映射 */
const replyStateMap = ref<Record<string, ReplyState>>({})

/** 评论列表 */
const commentList = ref<Comment[]>([])

/**
 * 获取指定评论的回复状态
 * @param commentId 评论ID
 * @returns 回复状态，不存在时返回 undefined
 */
function getReplyState(commentId: IdType): ReplyState | undefined {
  return replyStateMap.value[String(commentId)]
}

/**
 * 确保指定评论的回复状态存在，不存在则初始化
 * @param commentId 评论ID
 * @returns 回复状态对象
 */
function ensureReplyState(commentId: IdType): ReplyState {
  const key = String(commentId)
  if (!replyStateMap.value[key]) {
    replyStateMap.value[key] = {
      expanded: false,
      replies: [],
      currentPage: 0,
      totalPage: 0,
      totalCount: 0,
      loading: false
    }
  }
  return replyStateMap.value[key]
}

/**
 * 加载指定评论的回复（分页）
 * @param comment 根评论
 * @param page 页码（0-based），默认0
 */
async function loadReplies(comment: Comment, page: number = 0) {
  const state = ensureReplyState(comment.id)
  state.loading = true
  state.expanded = true
  try {
    // 请求第一页回复数据
    const res = (await SfcUtils.request(API.comment.listByCommentId(comment.id, page, REPLY_PAGE_SIZE))).data.data
    state.replies = res.content
    state.currentPage = page
    state.totalPage = res.totalPage
    state.totalCount = res.totalCount
  } catch (err) {
    SfcUtils.alert((err && err.toString) ? err.toString() : '加载回复失败')
    state.expanded = false
  } finally {
    state.loading = false
  }
}

/**
 * 折叠指定评论的回复
 * @param comment 根评论
 */
function collapseReplies(comment: Comment) {
  const state = replyStateMap.value[String(comment.id)]
  if (state) {
    state.expanded = false
  }
}

/**
 * 获取可见的页码列表（滑动窗口，最多5页）
 * @param state 回复状态
 * @returns 可见页码数组（0-based）
 */
function getVisiblePages(state: ReplyState | undefined): number[] {
  if (!state || state.totalPage === 0) return []
  const total = state.totalPage
  const current = state.currentPage
  // 总页数不超过5页时全部显示
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i)
  }
  // 滑动窗口：当前页前后各2页，共5页
  let start = Math.max(0, current - 2)
  const end = Math.min(total, start + 5)
  start = Math.max(0, end - 5)
  return Array.from({ length: end - start }, (_, i) => start + i)
}

/**
 * 设置回复目标
 * @param comment 被回复的评论
 */
const handleReply = (comment: Comment) => {
  replyTo.value = comment
}

/** 取消回复 */
const cancelReply = () => {
  replyTo.value = null
}

const actions = MethodInterceptor.createAsyncActionProxy({
  async loadData(page?: number, append?: boolean) {
    const list = (await SfcUtils.request(API.comment.listByTopicId(props.topicId, page))).data.data.content
    if (append) {
      list.forEach(e => {
        commentList.value.push(e)
      })
    }
    return list
  },
  async send() {
    if (!content.value?.length) {
      SfcUtils.alert('内容不能为空( •̀ ω •́ )y')
      return
    }
    try {
      await SfcUtils.request(API.comment.sendPublicComment(content.value, replyTo.value?.id))
      // 重新加载评论列表
      commentList.value = await this.loadData(0, false)
      // 清空回复状态，让用户重新展开获取最新回复
      replyStateMap.value = {}
      content.value = ''
      replyTo.value = null
      SfcUtils.snackbar('发送成功(*^▽^*)')
    } catch (err) {
      SfcUtils.alert((err && err.toString) ? err.toString() : '未知错误')
    }
  }
}, false, loadingManager)

/** 键盘事件处理：Ctrl+Enter发送 */
const keyupHandler = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key == 'Enter' && !loading.value) {
    actions.send()
  }
}
onMounted(() => {
  actions.loadData(0, true)
})
</script>

<script lang="ts">
import API from 'sfc-common/api'
import { Comment, IdType } from 'sfc-common/model'
import { LoadingManager } from 'sfc-common/utils/LoadingManager'
import { MethodInterceptor } from 'sfc-common/utils/MethodInterceptor'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'

export default defineComponent({
  name: 'CommentBoard'
})
</script>

<style scoped>

.message-area {
  max-height: v-bind(maxMessageHeight);
  margin-bottom: 6px;
  overflow: auto;
}

.reply-indicator {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), .6);
  padding: 2px 4px;
}

.cancel-reply {
  cursor: pointer;
  color: rgb(var(--v-theme-primary));
  margin-left: 6px;
}

.replies-area {
  margin-left: 20px;
  border-left: 2px solid rgba(var(--v-theme-on-surface), .1);
  padding-left: 6px;
}

.reply-toggle {
  cursor: pointer;
  font-size: 12px;
  color: rgb(var(--v-theme-primary));
  display: inline-block;
  padding: 2px 0;
}

.reply-pagination {
  font-size: 12px;
  padding: 4px 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.page-info {
  color: rgba(var(--v-theme-on-surface), .6);
}

.page-link {
  cursor: pointer;
  color: rgb(var(--v-theme-primary));
  padding: 0 4px;
}

.page-active {
  font-weight: bold;
  color: rgba(var(--v-theme-on-surface), 1);
}

.collapse-link {
  margin-left: 8px;
}
</style>
