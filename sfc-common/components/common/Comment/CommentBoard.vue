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
          <!-- 根评论 -->
          <CommentMessage :comment="comment" :can-send="canSend" @reply="handleReply" />

          <!-- 回复区域 -->
          <CommentReply
            :ref="(el: any) => setReplyRef(comment.id, el)"
            :root-comment="comment"
            :can-send="canSend"
            @reply="handleReply"
          />
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
            :disabled="!canSend"
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
const replyTo = ref<CommentVo | null>(null)

/** 评论列表 */
const commentList = ref<CommentVo[]>([])

/** CommentReply 组件引用映射（key 为根评论 id） */
const replyRefs = new Map<IdType, any>()

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
 * 设置回复目标
 * @param comment 被回复的评论
 */
const handleReply = (comment: CommentVo) => {
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
      const param: SendCommentParam = {
        content: content.value,
        replyId: replyTo.value?.id,
        topicId: props.topicId
      }
      if (props.topicId == 0) {
        await SfcUtils.request(API.comment.sendPublicComment(param))
      } else {
        await SfcUtils.request(API.comment.sendComment(param))
      }
      
      // 记录发送前回复的目标根评论 id，用于发送后展开回复
      // replyTo.value.replyId 指向根评论 id（如果是对根评论的回复，则 replyId 为 null，此时用 replyTo.value.id）
      const targetRootId = replyTo.value?.replyId || replyTo.value?.id

      // 重新加载评论列表
      commentList.value = await this.loadData(0, false)
      content.value = ''
      replyTo.value = null
      SfcUtils.snackbar('发送成功(*^▽^*)')

      // 如果是对已有根评论的回复，展开该评论的回复并跳转到最后一页
      if (targetRootId) {
        const replyComp = replyRefs.get(targetRootId)
        if (replyComp) {
          await replyComp.loadLastPage()
        }
      }
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
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'
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
