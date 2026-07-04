<template>
  <div class="d-flex">
    <!-- 头像区域 -->
    <div class="avatar-col">
      <UserAvatar :uid="comment.uid" :size="avatarSize" />
    </div>

    <!-- 内容区域 -->
    <div class="content-col pb-3" :class="{'reply-content': isReply}">
      <!-- 用户名 -->
      <div class="d-flex align-center flex-wrap ga-1 mb-1">
        <span class="text-body-2 font-weight-medium text-high-emphasis">
          {{ comment.username || '[游客]' }}
        </span>
        <!-- 回复提示 -->
        <span v-if="comment.replyUsername && isReply" class="text-caption text-medium-emphasis">
          回复 @{{ comment.replyUsername }}
        </span>
      </div>


      <!-- 评论正文（含截断） -->
      <div class="comment-text text-body-2">
        <!-- 回复提示 -->
        <div v-if="comment.replyUsername && !isReply" class="text-caption text-medium-emphasis">
          回复 @{{ comment.replyUsername }}
        </div>
        <template v-if="isLongContent && !expanded">
          <span>{{ truncatedContent }}...</span>
          <VBtn
            variant="text"
            density="compact"
            color="primary"
            class="expand-btn"
            @click="expanded = true"
          >
            展开
          </VBtn>
        </template>
        <template v-else>
          <span style="white-space: pre-wrap; word-break: break-word;">{{ comment.content }}</span>
          <VBtn
            v-if="isLongContent"
            variant="text"
            density="compact"
            color="primary"
            class="expand-btn"
            @click="expanded = false"
          >
            收起
          </VBtn>
        </template>
      </div>

      <!-- 操作栏 + 底部元信息 -->
      <div class="d-flex align-center mt-1">
        <span class="text-caption text-medium-emphasis">
          <span v-if="comment.ip">{{ comment.ip }} · </span>{{ date }}
        </span>
        <VBtn
          variant="text"
          density="compact"
          color="primary"
          class="reply-btn"
          :disabled="!canSend"
          @click="$emit('reply', comment)"
        >
          回复
        </VBtn>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CommentVo } from 'sfc-common/model'
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
import { PropType, computed, ref } from 'vue'

/** 评论内容截断阈值（字符数） */
const TRUNCATE_LENGTH = 200

const props = defineProps({
  comment: {
    type: Object as PropType<CommentVo>,
    default() { return {} }
  },
  /** 是否允许回复 */
  canSend: {
    type: Boolean,
    default: false
  },
  /**
   * 是否为回复消息
   */
  isReply: {
    type: Boolean,
    default: false
  }
})
const avatarSize = computed(() => props.isReply ? 24 : 40)
const emit = defineEmits<{
  (e: 'reply', comment: CommentVo): void
}>()
const date = computed(() => StringFormatter.toDate(props.comment.createAt))

/** 当前评论是否已展开（仅长评论有效） */
const expanded = ref(false)

/** 评论内容是否超过截断阈值 */
const isLongContent = computed(() => (props.comment.content?.length ?? 0) > TRUNCATE_LENGTH)

/** 截断后的评论内容 */
const truncatedContent = computed(() => (props.comment.content ?? '').substring(0, TRUNCATE_LENGTH))
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CommentMessage'
})
</script>

<style scoped>

.avatar-col {
  padding-top: 2px;
}

.content-col {
  flex: 1;
  min-width: 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
.content-col.reply-content {
  border-bottom: 0px
}

.comment-text {
  line-height: 1.6;
}

.expand-btn {
  min-width: 32px;
  height: 20px;
  font-size: 12px;
  margin-left: 2px;
}

.reply-btn {
  min-width: 48px;
  height: 28px;
  font-size: 12px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.reply-btn:hover {
  opacity: 1;
}
</style>
