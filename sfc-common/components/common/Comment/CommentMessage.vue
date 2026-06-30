<template>
  <div>
    <div class="d-flex comment-msg">
      <div class="d-flex justify-center">
        <div><UserAvatar style="margin: 3px 6px" :uid="comment.uid" /></div>
      </div>
      <div style="padding: 3px;width: 100%">
        <div class="tip">
          {{ comment.username || '[游客]' }}
        </div>
        <div>
          <template v-if="comment.replyUsername">
            <span class="reply-tip">回复 @{{ comment.replyUsername }}：</span>
          </template>
          {{ comment.content }}
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
    <div v-if="comment.replies && comment.replies.length" class="replies-area">
      <CommentMessage
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
        @reply="(c: any) => $emit('reply', c)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Comment } from 'sfc-common/model'
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
import { PropType, computed } from 'vue'

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
.replies-area {
  margin-left: 20px;
  border-left: 2px solid rgba(var(--v-theme-on-surface), .1);
  padding-left: 6px;
}
</style>