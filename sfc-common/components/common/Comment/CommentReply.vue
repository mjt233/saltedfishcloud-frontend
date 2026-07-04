<template>
  <!-- 回复区域 -->
  <div class="mb-2">
    <!-- 未展开：显示提示 -->
    <div v-if="!state.expanded && rootComment.replyCount != 0" class="reply-toggle-area">
      
      <!-- 加载中 -->
      <div v-if="state.loading" class="text-center pa-3">
        <VProgressCircular
          indeterminate
          size="24"
          width="2"
          color="primary"
        />
      </div>
      <template v-else>
        <span
          prepend-icon="mdi-comment-text-outline"
          class="tip"
        >
          共{{ rootComment.replyCount }}条回复, <span class="cursor-pointer reply-action-text" @click="loadReplies(0)">点击查看</span>
        </span>
      </template>

    </div>

    <!-- 已展开（带过渡动画） -->
    <VExpandTransition>
      <div v-show="state.expanded" class="replies-expanded-wrapper">

        <!-- 回复列表 + 分页 -->
        <div>
          <CommentMessage
            v-for="reply in state.replies"
            :key="reply.id"
            :comment="reply"
            :can-send="canSend"
            is-reply
            @reply="handleReply"
          />

          <!-- 分页栏 -->
          <div v-if="state.totalPage > 1" class="reply-pagination">
            <span class="text-caption text-medium-emphasis mr-2">
              共{{ state.totalPage }}页
            </span>
            <VBtn
              v-if="state.currentPage > 0"
              variant="text"
              density="compact"
              color="primary"
              style="padding: 0;"
              @click="loadReplies(state.currentPage - 1)"
            >
              上一页
            </VBtn>
            <VBtn
              v-for="p in visiblePages"
              :key="p"
              variant="text"
              style="min-width: 0;padding: 0 3px"
              density="compact"
              :color="p === state.currentPage ? 'primary' : 'default'"
              :class="{ 'font-weight-bold': p === state.currentPage }"
              @click="loadReplies(p)"
            >
              {{ p + 1 }}
            </VBtn>
            <VBtn
              v-if="state.currentPage < state.totalPage - 1"
              variant="text"
              density="compact"
              color="primary"
              style="padding: 0;"
              @click="loadReplies(state.currentPage + 1)"
            >
              下一页
            </VBtn>
            <span
              class="ml-2 reply-action-text"
              @click="collapseReplies"
            >
              收起
            </span>
          </div>

          <!-- 仅一页时只显示收起 -->
          <div v-else>
            <span
              class="reply-action-text"
              @click="collapseReplies"
            >
              收起
            </span>
          </div>
        </div>
      </div>
    </VExpandTransition>

    <!-- 内联回复输入框（在回复区域最下方显示） -->
    <VSlideYTransition>
      <div v-if="isActiveReply" class="inline-reply-area">
        <!-- 回复提示 -->
        <div class="reply-indicator">
          <VIcon size="16" class="mr-1">
            mdi-reply
          </VIcon>
          <span>回复 {{ replyTarget?.replyId ? (' @' + (replyTarget?.username || '[游客]')) : replyTarget?.username }}</span>
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

        <!-- 输入框 -->
        <div class="d-flex align-end ga-2">
          <SimpleTextarea
            v-model="replyContent"
            class="reply-input"
            placeholder="请输入回复内容"
            @keyup="replyKeyupHandler"
          />
          <VBtn
            icon="mdi-send"
            color="primary"
            variant="flat"
            size="small"
            class="reply-send-btn flex-shrink-0"
            :disabled="!replyContent?.trim()"
            @click="sendReply"
          />
        </div>
      </div>
    </VSlideYTransition>
  </div>
</template>

<script setup lang="ts">
import { CommentVo, IdType, SendCommentParam } from 'sfc-common/model'
import { PropType, computed, nextTick, reactive, ref } from 'vue'
import API from 'sfc-common/api'
import SfcUtils from 'sfc-common/utils/SfcUtils'

/** 每页回复数量 */
const REPLY_PAGE_SIZE = 10

/** 回复区域的状态 */
interface ReplyState {
  /** 是否已展开 */
  expanded: boolean
  /** 回复列表 */
  replies: CommentVo[]
  /** 当前页码（0-based） */
  currentPage: number
  /** 总页数 */
  totalPage: number
  /** 是否正在加载 */
  loading: boolean
}

const props = defineProps({
  /** 根评论数据 */
  rootComment: {
    type: Object as PropType<CommentVo>,
    required: true
  },
  /** 是否允许回复 */
  canSend: {
    type: Boolean,
    default: false
  },
  /** 当前根评论是否为活跃回复目标 */
  isActiveReply: {
    type: Boolean,
    default: false
  },
  /** 回复目标评论（用户点击"回复"的那条评论） */
  replyTarget: {
    type: Object as PropType<CommentVo | null>,
    default: null
  },
  /** 话题ID（用于区分 sendComment / sendPublicComment） */
  topicId: {
    type: [String, Number] as PropType<IdType>,
    default: 0
  }
})

const emit = defineEmits<{
  (e: 'reply', comment: CommentVo): void
  /** 取消内联回复 */
  (e: 'cancel-reply'): void
  /** 内联回复发送成功 */
  (e: 'reply-sent'): void
}>()

/** 回复区域状态 */
const state = reactive<ReplyState>({
  expanded: false,
  replies: [],
  currentPage: 0,
  totalPage: 0,
  loading: false
})

/** 可见页码列表（滑动窗口，最多5页） */
const visiblePages = computed(() => {
  const total = state.totalPage
  if (total === 0) return []
  const current = state.currentPage
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i)
  }
  let start = Math.max(0, current - 2)
  const end = Math.min(total, start + 5)
  start = Math.max(0, end - 5)
  return Array.from({ length: end - start }, (_, i) => start + i)
})

/**
 * 加载回复列表（分页）
 * @param page 页码（0-based）
 */
async function loadReplies(page: number = 0) {
  state.loading = true
  try {
    const res = (await SfcUtils.request(API.comment.listByCommentId(props.rootComment.id, page, REPLY_PAGE_SIZE))).data.data
    state.replies = res.content
    state.currentPage = page
    state.totalPage = res.totalPage
    await nextTick()
    state.expanded = true
  } catch (err) {
    SfcUtils.alert((err && err.toString) ? err.toString() : '加载回复失败')
    state.expanded = false
  } finally {
    state.loading = false
  }
}
/** 内联回复输入框内容 */
const replyContent = ref('')

/**
 * 内联回复发送逻辑
 * 发送成功后刷新回复列表并通知父组件
 */
async function sendReply() {
  if (!replyContent.value?.trim()) {
    SfcUtils.alert('内容不能为空( •̀ ω •́ )y')
    return
  }
  try {
    const param: SendCommentParam = {
      content: replyContent.value,
      replyId: props.rootComment.id,
      topicId: props.topicId,
      // 仅当回复目标是一条回复消息（而非根评论）时，设置 atUid 为被回复人的 uid
      ...(props.replyTarget?.replyId ? { atUid: props.replyTarget.uid } : {})
    }
    if (props.topicId == 0) {
      await SfcUtils.request(API.comment.sendPublicComment(param))
    } else {
      await SfcUtils.request(API.comment.sendComment(param))
    }
    SfcUtils.snackbar('发送成功(*^▽^*)')
    replyContent.value = ''
    // 刷新回复列表到最后一页
    await loadLastPage()
    emit('reply-sent')
  } catch (err) {
    SfcUtils.alert((err && err.toString) ? err.toString() : '未知错误')
  }
}

/** 取消内联回复 */
function cancelReply() {
  replyContent.value = ''
  emit('cancel-reply')
}

/** 内联输入框键盘事件：Ctrl+Enter发送 */
const replyKeyupHandler = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key == 'Enter') {
    sendReply()
  }
}
/** 折叠回复列表 */
function collapseReplies() {
  state.expanded = false
}

/**
 * 加载最后一页回复（发送回复后调用，确保能看到刚发送的回复）
 */
async function loadLastPage() {
  state.expanded = true
  // 先获取总页数
  try {
    const res = (await SfcUtils.request(API.comment.listByCommentId(props.rootComment.id, 0, REPLY_PAGE_SIZE))).data.data
    const lastPage = Math.max(0, res.totalPage - 1)
    await loadReplies(lastPage)
  } catch (err) {
    SfcUtils.alert((err && err.toString) ? err.toString() : '加载回复失败')
  }
}

/** 转发回复事件 */
function handleReply(comment: CommentVo) {
  emit('reply', comment)
}

defineExpose({
  loadReplies,
  loadLastPage,
  collapseReplies
})
</script>

<script lang="ts">
import { defineComponent } from 'vue'
import CommentMessage from './CommentMessage.vue'

export default defineComponent({
  name: 'CommentReply'
})
</script>

<style scoped>

.reply-toggle-area {
  padding: 2px 0;
}

.reply-pagination {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 6px 8px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

/* 内联回复输入框 */
.inline-reply-area {
  margin-top: 8px;
}

.inline-reply-area .reply-indicator {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  padding: 4px 6px;
  margin-bottom: 4px;
  background: rgba(var(--v-theme-primary), 0.05);
  border-radius: 6px;
}

.inline-reply-area .reply-input {
  min-height: 36px;
}

.inline-reply-area .reply-send-btn {
  margin-bottom: 2px;
}
.reply-action-text {
  cursor: pointer;
  transition: all .2s;
}
.reply-action-text:hover {
  color: rgba(var(--v-theme-primary), .7)
}
</style>
