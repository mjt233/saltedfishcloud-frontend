<template>
  <!-- 评论编辑器：SimpleTextarea + 发送按钮 -->
  <div class="d-flex align-end ga-2">
    <SimpleTextarea
      v-model="innerValue"
      class="comment-editor-input"
      :placeholder="placeholder"
      :disabled="disabled"
      @keyup="keyupHandler"
    />
    <VBtn
      icon="mdi-send"
      color="primary"
      variant="flat"
      class="comment-editor-send-btn flex-shrink-0"
      :disabled="disabled || !innerValue?.trim()"
      @click="handleSend"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SimpleTextarea from '../SimpleTextarea.vue'

const props = defineProps({
  /** 输入框内容（v-model） */
  modelValue: {
    type: String,
    default: ''
  },
  /** 是否禁用输入和发送 */
  disabled: {
    type: Boolean,
    default: false
  },
  /** 输入框占位文本 */
  placeholder: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  /** 点击发送按钮或 Ctrl+Enter 时触发 */
  (e: 'send'): void
}>()

/** 内部 v-model 计算属性，同步更新父组件 */
const innerValue = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val)
})

/** 点击发送按钮 */
function handleSend() {
  if (props.disabled || !innerValue.value?.trim()) {
    return
  }
  emit('send')
}

/** Ctrl+Enter 发送 */
function keyupHandler(e: KeyboardEvent) {
  if (e.ctrlKey && e.key === 'Enter') {
    handleSend()
  }
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CommentEditor'
})
</script>

<style scoped>
.comment-editor-input {
  min-height: 36px;
}

.comment-editor-send-btn {
  margin-bottom: 2px;
}
</style>
