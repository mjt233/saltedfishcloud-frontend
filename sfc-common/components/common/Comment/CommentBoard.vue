<template>
  <VCard flat class="comment-board">
    <LoadingMask :loading="loading" />

    <!-- 评论列表 -->
    <div class="message-area">
      <VList v-if="commentList.length > 0" class="comment-list">
        <VListItem
          v-for="comment in commentList"
          :key="comment.id"
          class="comment-item"
        >
          <CommentMessage :comment="comment" @reply="handleReply" />

          <!-- 回复区域 -->
          <div v-if="comment.replyCount && comment.replyCount > 0" class="replies-section">
            <!-- 未展开：显示提示 -->
            <div v-if="!getReplyState(comment.id)?.expanded" class="reply-toggle-area">
              <VBtn
                variant="text"
                density="compact"
                prepend-icon="mdi-comment-text-outline"
                class="tip"
                @click="loadReplies(comment, 0)"
              >
                共{{ comment.replyCount }}条回复, 点击查看
              </VBtn>
            </div>

            <!-- 已展开 -->
            <template v-else>
              <!-- 加载中 -->
              <div v-if="getReplyState(comment.id)?.loading" class="text-center pa-3">
                <VProgressCircular
                  indeterminate
                  size="24"
                  width="2"
                  color="primary"
                />
              </div>

              <!-- 回复列表 + 分页 -->
              <template v-else>
                <VCard class="replies-card">
                  <CommentReply
                    v-for="reply in getReplyState(comment.id)?.replies ?? []"
                    :key="reply.id"
                    :comment="reply"
                    @reply="handleReply"
                  />

                  <!-- 分页栏 -->
                  <div v-if="(getReplyState(comment.id)?.totalPage ?? 0) > 1" class="reply-pagination">
                    <span class="text-caption text-medium-emphasis mr-2">
                      共{{ getReplyState(comment.id)?.totalPage }}页
                    </span>
                    <VBtn
                      v-if="(getReplyState(comment.id)?.currentPage ?? 0) > 0"
                      variant="text"
                      density="compact"
                      color="primary"
                      style="padding: 0;"
                      @click="loadReplies(comment, (getReplyState(comment.id)?.currentPage ?? 0) - 1)"
                    >
                      上一页
                    </VBtn>
                    <VBtn
                      v-for="p in getVisiblePages(getReplyState(comment.id))"
                      :key="p"
                      variant="text"
                      style="min-width: 0;padding: 0 3px"
                      density="compact"
                      :color="p === (getReplyState(comment.id)?.currentPage ?? 0) ? 'primary' : 'default'"
                      :class="{ 'font-weight-bold': p === (getReplyState(comment.id)?.currentPage ?? 0) }"
                      @click="loadReplies(comment, p)"
                    >
                      {{ p + 1 }}
                    </VBtn>
                    <VBtn
                      v-if="(getReplyState(comment.id)?.currentPage ?? 0) < (getReplyState(comment.id)?.totalPage ?? 0) - 1"
                      variant="text"
                      density="compact"
                      color="primary"
                      style="padding: 0;"
                      @click="loadReplies(comment, (getReplyState(comment.id)?.currentPage ?? 0) + 1)"
                    >
                      下一页
                    </VBtn>
                    <VBtn
                      variant="text"
                      density="compact"
                      color="default"
                      class="ml-2"
                      @click="collapseReplies(comment)"
                    >
                      收起
                    </VBtn>
                  </div>

                  <!-- 仅一页时只显示收起 -->
                  <div v-else class="text-center pa-1">
                    <VBtn
                      variant="text"
                      density="compact"
                      color="default"
                      @click="collapseReplies(comment)"
                    >
                      收起
                    </VBtn>
                  </div>
                </VCard>
              </template>
            </template>
          </div>
        </VListItem>
      </VList>

      <!-- 空状态 -->
      <div v-else class="text-center pa-6 text-medium-emphasis">
        <VIcon size="40" class="mb-2" color="disabled">
          mdi-comment-text-outline
        </VIcon>
        <div class="text-body-2">
          暂无评论，来说点什么吧~
        </div>
      </div>
    </div>

    <!-- 发送区域 -->
    <div ref="sendArea" class="send-area">
      <!-- 回复指示 -->
      <VSlideYTransition>
        <div v-if="replyTo" class="reply-indicator">
          <VIcon size="16" class="mr-1">
            mdi-reply
          </VIcon>
          <span>回复 @{{ replyTo.username || '[游客]' }}</span>
          <VBtn
            variant="text"
            density="compact"
            color="default"
            class="ml-1"
            @click="cancelReply"
          >
            取消
          </VBtn>
        </div>
      </VSlideYTransition>

      <!-- 输入框 -->
      <div class="d-flex align-end ga-2">
        <SimpleTextarea
          v-model="content"
          class="comment-input"
          placeholder="友善留言，Ctrl+Enter发送哦~"
          @keyup="keyupHandler"
        />
        <VBtn
          icon="mdi-send"
          color="primary"
          variant="flat"
          class="send-btn flex-shrink-0"
          :disabled="!content?.trim()"
          @click="actions.send"
        />
      </div>
    </div>
  </VCard>
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
.comment-board {
  background: transparent !important;
}

.message-area {
  max-height: v-bind(maxMessageHeight);
  margin-bottom: 8px;
  overflow: auto;
}

.comment-list {
  background: transparent !important;
  padding: 0;
}

.comment-item {
  padding: 0;
  border-bottom: none;
}

.replies-section {
  margin: 4px 4px 4px 24px;
}

.reply-toggle-area {
  padding: 2px 0;
}

.replies-card {
  border-radius: 8px;
  padding: 4px 8px;
}

.reply-pagination {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 6px 8px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.send-area {
  padding-top: 8px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.reply-indicator {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  padding: 4px 8px;
  margin-bottom: 4px;
  background: rgba(var(--v-theme-primary), 0.05);
  border-radius: 6px;
}

.comment-input {
  min-height: 36px;
}

.send-btn {
  margin-bottom: 2px;
}
</style>
