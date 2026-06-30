<template>
  <div>
    <div class="comment-msg d-flex">
      <div class="d-flex justify-center">
        <div><UserAvatar style="margin: 3px 6px" :uid="comment.uid" /></div>
      </div>
      <div style="padding: 3px;width: 100%">
        <div class="tip">
          {{ comment.username || '[游客]' }}
        </div>
        <div class="content-area">
          <template v-if="comment.replyUsername">
            <span class="reply-tip">回复 @{{ comment.replyUsername }}：</span>
          </template>
          <!-- 内容超长时截断显示 -->
          <template v-if="isLongContent && !expanded">
            <span>{{ truncatedContent }}...</span>
            <a class="expand-btn" @click="expanded = true">展开</a>
          </template>
          <!-- 正常显示或已展开 -->
          <template v-else>
            <span>{{ comment.content }}</span>
            <a v-if="isLongContent" class="expand-btn" @click="expanded = false">收起</a>
          </template>
        </div>
        <div class="tip footer">
          <template v-if="comment.ip">
            ip {{ comment.ip || 'null' }}
          </template>
          发布于 {{ date }}
          <a class="reply-btn" @click="$emit('reply', comment)">回复</a>
        </div>
      </div>
    </div>
  </div>
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
.comment-msg {
  padding: 6px 0 3px 0;
  margin: 3px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), .2);
}
.footer {
  text-align: right;
}
.reply-tip {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), .5);
}
.reply-btn {
  cursor: pointer;
  font-size: 12px;
  color: rgb(var(--v-theme-primary));
  margin-left: 8px;
}
.expand-btn {
  cursor: pointer;
  font-size: 12px;
  color: rgb(var(--v-theme-primary));
  margin-left: 4px;
}
</style>
