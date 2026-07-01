<template>
  <!-- 回复区域 -->
  <div v-if="rootComment.replyCount && rootComment.replyCount > 0" class="replies-section">
    <!-- 未展开：显示提示 -->
    <div v-if="!state.expanded" class="reply-toggle-area">
      <VBtn
        variant="text"
        density="compact"
        prepend-icon="mdi-comment-text-outline"
        class="tip"
        @click="loadReplies(0)"
      >
        共{{ rootComment.replyCount }}条回复, 点击查看
      </VBtn>
    </div>

    <!-- 已展开 -->
    <template v-else>
      <!-- 加载中 -->
      <div v-if="state.loading" class="text-center pa-3">
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
          <CommentMessage
            v-for="reply in state.replies"
            :key="reply.id"
            :comment="reply"
            :can-send="canSend"
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
            <VBtn
              variant="text"
              density="compact"
              color="default"
              class="ml-2"
              @click="collapseReplies"
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
              @click="collapseReplies"
            >
              收起
            </VBtn>
          </div>
        </VCard>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { CommentVo } from 'sfc-common/model'
import { PropType, computed, reactive } from 'vue'
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
  }
})

const emit = defineEmits<{
  (e: 'reply', comment: CommentVo): void
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
  state.expanded = true
  try {
    const res = (await SfcUtils.request(API.comment.listByCommentId(props.rootComment.id, page, REPLY_PAGE_SIZE))).data.data
    state.replies = res.content
    state.currentPage = page
    state.totalPage = res.totalPage
  } catch (err) {
    SfcUtils.alert((err && err.toString) ? err.toString() : '加载回复失败')
    state.expanded = false
  } finally {
    state.loading = false
  }
}

/** 折叠回复列表 */
function collapseReplies() {
  state.expanded = false
}

/** 转发回复事件 */
function handleReply(comment: CommentVo) {
  emit('reply', comment)
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CommentReply'
})
</script>

<style scoped>
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
</style>
