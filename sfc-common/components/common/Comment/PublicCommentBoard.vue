<template>
  <CommentBoard
    :topic-id="0"
    :can-send="hasLogin || context.feature.value.allowAnonymousComments"
    :max-message-height="maxMessageHeight"
  />
</template>

<script setup lang="ts">
const props = defineProps({
  
  /** 消息区域最大高度 */
  maxMessageHeight: {
    type: String,
    default: '480px'
  }
})
const context = getContext()
const hasLogin = computed(() => ConditionFunction.hasLogin(context))
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed } from 'vue'
import CommentBoard from './CommentBoard.vue'
import { ConditionFunction, getContext } from 'sfc-common'

export default defineComponent({
  name: 'PublicCommentBoard'
})
</script>