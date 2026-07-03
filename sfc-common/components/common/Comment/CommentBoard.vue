<template>
  <VCard flat class="comment-board">
    <LoadingMask :loading="loading" />

    <!-- 评论列表 -->
    <div ref="messageAreaRef" class="message-area">
      <VList v-if="commentList.length > 0" class="comment-list">
        <VInfiniteScroll ref="infiniteScrollRef" @load="onInfiniteLoad">
          <VListItem
            v-for="comment in commentList"
            :id="'comment-' + comment.id"
            :key="comment.id"
            class="comment-item"
          >
            <!-- 根评论 -->
            <CommentMessage :comment="comment" :can-send="canSend" @reply="handleReply" />

            <!-- 回复区域 -->
            <CommentReply
              :ref="(el: any) => setReplyRef(comment.id, el)"
              :root-comment="comment"
              :can-send="canSend"
              :is-active-reply="activeReplyRootId === comment.id"
              :reply-target="replyTarget"
              :topic-id="topicId"
              @reply="handleReply"
              @cancel-reply="handleCancelReply"
              @reply-sent="handleReplySent"
            />
          </VListItem>

          <!-- 底部加载/空状态由 VInfiniteScroll 自动管理 -->
          <template #loading>
            <div class="text-center pa-2">
              <VProgressCircular
                indeterminate
                size="20"
                width="2"
                color="primary"
              />
            </div>
          </template>
          <template #empty>
            <div class="text-center text-caption text-medium-emphasis pa-2">
              没有更多了~
            </div>
          </template>
        </VInfiniteScroll>
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
      <!-- 输入框（仅用于发送新根评论） -->
      <div class="d-flex align-end ga-2">
        <SimpleTextarea
          v-model="content"
          class="comment-input"
          placeholder="友善留言，Ctrl+Enter发送哦~"
          :disabled="!canSend"
          @keyup="keyupHandler"
        />
        <VBtn
          icon="mdi-send"
          color="primary"
          variant="flat"
          class="send-btn flex-shrink-0"
          :disabled="!canSend || !content?.trim()"
          @click="actions.send"
        />
      </div>
    </div>
  </VCard>
</template>

<script setup lang="ts">
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
/** 当前活跃的回复目标根评论 ID（为 null 时表示不在内联回复状态） */
const activeReplyRootId = ref<IdType | null>(null)
/** 当前回复目标评论（用户点击"回复"的那条） */
const replyTarget = ref<CommentVo | null>(null)

/** 评论列表 */
const commentList = ref<CommentVo[]>([])
/** 消息区域滚动容器 */
const messageAreaRef = ref<HTMLElement | null>(null)

/** CommentReply 组件引用映射（key 为根评论 id） */
const replyRefs = new Map<IdType, any>()

// ---- 滚动加载分页状态 ----
/** 当前已加载的页码（0-based），-1 表示尚未加载过 */
const currentPage = ref(-1)
/** 总页数 */
const totalPage = ref(0)
/** VInfiniteScroll 组件引用，用于发送后重置加载状态 */
const infiniteScrollRef = ref<any>(null)

/**
 * VInfiniteScroll 滚动加载回调
 * @param done 完成回调，传入 'ok' | 'empty' | 'error'
 */
async function onInfiniteLoad({ done }: { done: (status: 'ok' | 'empty' | 'error') => void }) {
  if (currentPage.value >= totalPage.value - 1) {
    done('empty')
    return
  }
  try {
    const nextPage = currentPage.value + 1
    const res = (await SfcUtils.request(API.comment.listByTopicId(props.topicId, nextPage))).data.data
    res.content.forEach(e => {
      commentList.value.push(e)
    })
    currentPage.value = nextPage
    totalPage.value = res.totalPage
    done('ok')
  } catch {
    done('error')
  }
}

/**
 * 设置 CommentReply 组件引用
 * @param id 根评论 id
 * @param el 组件实例
 */
const setReplyRef = (id: IdType, el: any) => {
  if (el) {
    replyRefs.set(id, el)
  } else {
    replyRefs.delete(id)
  }
}

/**
 * 设置内联回复目标
 * @param comment 被回复的评论（可能是根评论或嵌套回复）
 */
async function handleReply(comment: CommentVo) {
  // 计算根评论 ID：如果是嵌套回复，replyId 指向根评论；如果本身就是根评论，用其 id
  const rootId = comment.replyId || comment.id
  activeReplyRootId.value = rootId
  replyTarget.value = comment

  // 等待 DOM 更新 + VSlideYTransition 动画完成
  await nextTick()
  await SfcUtils.sleep(150)

  // 如果内联输入框不在可视区域内，滚动 messageArea 使其可见
  const rootEl = document.getElementById(`comment-${rootId}`)
  if (rootEl) {
    const inputArea = rootEl.querySelector('.inline-reply-area') as HTMLElement | null
    const container = messageAreaRef.value
    if (inputArea && container) {
      const containerRect = container.getBoundingClientRect()
      const inputRect = inputArea.getBoundingClientRect()
      // 判断输入框底部是否在容器可视区域之外
      if (inputRect.bottom > containerRect.bottom) {
        // 滚动使输入框出现在容器底部
        const scrollDelta = inputRect.bottom - containerRect.bottom + 16 // 16px 留白
        container.scrollBy({ top: scrollDelta, behavior: 'smooth' })
      }
    }
  }
}

/** 取消内联回复（由 CommentReply 触发） */
const handleCancelReply = () => {
  activeReplyRootId.value = null
  replyTarget.value = null
}

/**
 * 内联回复发送成功后的处理（由 CommentReply 触发）
 * 刷新根评论列表，滚动到目标评论位置，重置无限滚动
 */
async function handleReplySent() {
  const targetRootId = activeReplyRootId.value
  activeReplyRootId.value = null
  replyTarget.value = null
  // 刷新根评论列表
  await actions.loadData(0, false)
  // 重置无限滚动
  infiniteScrollRef.value?.reset()
  // 滚动到刚回复的根评论位置
  if (targetRootId) {
    nextTick(() => {
      const targetEl = document.getElementById(`comment-${targetRootId}`)
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })
  }
}

const actions = MethodInterceptor.createAsyncActionProxy({
  async loadData(page?: number, append?: boolean) {
    const res = (await SfcUtils.request(API.comment.listByTopicId(props.topicId, page))).data.data
    const list = res.content
    if (append) {
      list.forEach(e => {
        commentList.value.push(e)
      })
    }
    // 更新分页状态
    currentPage.value = page ?? 0
    totalPage.value = res.totalPage
    return list
  },
  async send() {
    if (!content.value?.length) {
      SfcUtils.alert('内容不能为空( •̀ ω •́ )y')
      return
    }
    try {
      // 全局输入框仅用于发送新根评论，replyId 为空
      const param: SendCommentParam = {
        content: content.value,
        topicId: props.topicId
      }
      if (props.topicId == 0) {
        await SfcUtils.request(API.comment.sendPublicComment(param))
      } else {
        await SfcUtils.request(API.comment.sendComment(param))
      }

      // 重新加载评论列表
      commentList.value = await this.loadData(0, false)
      content.value = ''
      SfcUtils.snackbar('发送成功(*^▽^*)')

      // 重置 VInfiniteScroll 内部状态，使其能再次触发 load 事件
      infiniteScrollRef.value?.reset()

      // 发送新根评论后滚动到顶部
      nextTick(() => {
        messageAreaRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
      })
    } catch (err) {
      SfcUtils.alert((err && err.toString) ? err.toString() : '未知错误')
    }
  }
}, false, loadingManager)

/** 键盘事件处理：Ctrl+Enter发送 */
const keyupHandler = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key == 'Enter' && !loading.value && props.canSend) {
    actions.send()
  }
}

onMounted(() => {
  actions.loadData(0, true)
})
</script>

<script lang="ts">
import API from 'sfc-common/api'
import { CommentVo, IdType, SendCommentParam } from 'sfc-common/model'
import { LoadingManager } from 'sfc-common/utils/LoadingManager'
import { MethodInterceptor } from 'sfc-common/utils/MethodInterceptor'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, nextTick } from 'vue'
import CommentMessage from './CommentMessage.vue'
import CommentReply from './CommentReply.vue'

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
