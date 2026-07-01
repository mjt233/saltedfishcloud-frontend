<template>
  <VCard
    class="comment-card"
    variant="text"
    :ripple="false"
  >
    <div class="comment-body d-flex">
      <!-- 头像区域 -->
      <div class="avatar-col">
        <UserAvatar :uid="comment.uid" :size="36" />
      </div>

      <!-- 内容区域 -->
      <div class="content-col">
        <!-- 用户名 + 元信息 -->
        <div class="d-flex align-center flex-wrap ga-1 mb-1">
          <span class="text-body-2 font-weight-medium text-high-emphasis">
            {{ comment.username || '[游客]' }}
          </span>
          <span v-if="comment.ip" class="text-caption text-medium-emphasis">
            · {{ comment.ip }}
          </span>
          <span class="text-caption text-medium-emphasis">· {{ date }}</span>
        </div>

        <!-- 回复提示 -->
        <div v-if="comment.replyUsername" class="text-caption text-medium-emphasis mb-1">
          <VIcon size="14" class="mr-1" color="medium-emphasis">
            mdi-reply
          </VIcon>
          回复 @{{ comment.replyUsername }}
        </div>

        <!-- 评论正文（含截断） -->
        <div class="comment-text text-body-2">
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

        <!-- 操作栏 -->
        <div class="d-flex align-center mt-1">
          <VBtn
            variant="text"
            density="compact"
            color="primary"
            class="reply-btn"
            @click="$emit('reply', comment)"
          >
            <VIcon size="16" class="mr-1">
              mdi-reply
            </VIcon>
            回复
          </VBtn>
        </div>
      </div>
    </div>
  </VCard>
</template>

<script setup lang="ts">
import { Comment } from 'sfc-common/model'
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
import { PropType, computed, ref } from 'vue'

/** 评论内容截断阈值（字符数） */
const TRUNCATE_LENGTH = 200

const props = defineProps({
  comment: {
    type: Object as PropType<Comment>,
    default() { return {} }
  }
})
const emit = defineEmits<{
  (e: 'reply', comment: Comment): void
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
.comment-card {
  padding: 8px 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: transparent !important;
}

.comment-body {
  gap: 8px;
}

.avatar-col {
  flex-shrink: 0;
  padding-top: 2px;
}

.content-col {
  flex: 1;
  min-width: 0;
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
