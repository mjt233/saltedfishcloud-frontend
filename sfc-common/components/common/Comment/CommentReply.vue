<template>
  <div class="comment-reply d-flex pa-2">
    <!-- 头像 -->
    <div class="reply-avatar flex-shrink-0">
      <UserAvatar :uid="comment.uid" :size="28" />
    </div>

    <!-- 内容 -->
    <div class="reply-body flex-grow-1 min-w-0 ml-2">
      <!-- 用户名 -->
      <div class="text-caption text-medium-emphasis mb-1">
        {{ comment.username || '[游客]' }}
        <span v-if="comment.replyUsername" class="reply-tag">
          回复 @{{ comment.replyUsername }}
        </span>
      </div>

      <!-- 正文（含截断） -->
      <div class="reply-content text-body-2">
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
          <span>{{ comment.content }}</span>
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

      <!-- 底部操作 -->
      <div class="d-flex align-center mt-1 ga-2">
        <span class="text-caption text-medium-emphasis">{{ date }}</span>
        <VBtn
          variant="text"
          density="compact"
          color="primary"
          class="reply-action-btn"
          @click="$emit('reply', comment)"
        >
          回复
        </VBtn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Comment } from 'sfc-common/model'
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
import { PropType, computed, ref } from 'vue'

/** 回复内容截断阈值（字符数） */
const TRUNCATE_LENGTH = 200

const props = defineProps({
  /** 评论数据 */
  comment: {
    type: Object as PropType<Comment>,
    default() { return {} }
  }
})

const emit = defineEmits<{
  (e: 'reply', comment: Comment): void
}>()

/** 格式化日期 */
const date = computed(() => StringFormatter.toDate(props.comment.createAt))

/** 当前回复是否已展开（仅长回复有效） */
const expanded = ref(false)

/** 回复内容是否超过截断阈值 */
const isLongContent = computed(() => (props.comment.content?.length ?? 0) > TRUNCATE_LENGTH)

/** 截断后的回复内容 */
const truncatedContent = computed(() => (props.comment.content ?? '').substring(0, TRUNCATE_LENGTH))
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CommentReply'
})
</script>

<style scoped>
.comment-reply {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.comment-reply:last-child {
  border-bottom: none;
}

.reply-avatar {
  padding-top: 2px;
}

.reply-tag {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.reply-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
}

.expand-btn {
  min-width: 28px;
  height: 18px;
  font-size: 11px;
  margin-left: 2px;
}

.reply-action-btn {
  min-width: 32px;
  height: 24px;
  font-size: 12px;
}
</style>
