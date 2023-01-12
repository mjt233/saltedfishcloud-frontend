<template>
  <div class="d-flex comment-msg">
    <div class="d-flex justify-center">
      <div><UserAvatar style="margin: 3px 6px" :uid="comment.uid" /></div>
    </div>
    <div style="padding: 3px;width: 100%">
      <div class="tip">
        {{ comment.username || '[游客]' }}
      </div>
      <div>{{ comment.content }}</div>
      <div class="tip footer">
        ip {{ comment.ip || 'null' }} 发布于 {{ date }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  comment: {
    type: Object as PropType<Comment>,
    default() { return {} }
  }
})
const date = computed(() => StringFormatter.toDate(props.comment.createAt))

</script>

<script lang="ts">
import { Comment } from '@/core/model'
import { StringFormatter } from '@/utils/StringFormatter'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, compile, computed } from 'vue'

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
</style>