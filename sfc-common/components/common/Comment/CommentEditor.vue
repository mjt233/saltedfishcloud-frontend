<template>
  <!-- 评论编辑器：SimpleTextarea + 表情按钮 + 发送按钮 -->
  <div ref="rootRef" class="d-flex align-center ga-2">
    <VTextarea
      v-model="innerValue"
      auto-grow
      style="font-size: 12px;"
      :placeholder="placeholder"
      :disabled="disabled"
      class="comment-editor-input"
      variant="outlined"
      :max-rows="10"
      rows="2"
      hide-details
      @keyup="keyupHandler"
    >
      <template #append-inner>
        <div class="d-flex align-end pb-4" style="height: 100%;">
          <!-- 表情选择按钮 -->
          <EmojiPicker
            :disabled="disabled"
            class="comment-editor-emoji-btn flex-shrink-0"
            @select="insertEmoji"
          />
          <!-- 发送按钮 -->
          <VBtn
            variant="text"
            size="small"
            icon="mdi-send"
            color="primary"
            class="comment-editor-send-btn flex-shrink-0"
            :disabled="disabled || !innerValue?.trim()"
            @click="handleSend"
          />
        </div>
      </template>
    </VTextarea>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import SimpleTextarea from '../SimpleTextarea.vue'
import EmojiPicker from './EmojiPicker.vue'
import type { EmojiItem } from './emoji-data'

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

/** 根元素引用，用于查找内部的 textarea DOM */
const rootRef = ref<HTMLElement>()
/** 内部 textarea DOM 元素引用 */
const textareaEl = ref<HTMLTextAreaElement>()
/** 当前光标位置，用于在指定位置插入表情 */
const cursorPos = ref(0)

/** 组件挂载后获取内部 textarea 元素并监听光标变化 */
onMounted(() => {
  // SimpleTextarea 渲染的是原生 textarea，通过根元素查找
  const ta = rootRef.value?.querySelector('textarea') as HTMLTextAreaElement | null
  if (!ta) {
    return
  }
  textareaEl.value = ta
  // 监听多种事件以实时记录光标位置
  ta.addEventListener('input', updateCursor)
  ta.addEventListener('click', updateCursor)
  ta.addEventListener('keyup', updateCursor)
  ta.addEventListener('select', updateCursor)
  ta.addEventListener('focus', updateCursor)
})

/** 更新当前光标位置 */
function updateCursor() {
  if (textareaEl.value) {
    cursorPos.value = textareaEl.value.selectionStart ?? innerValue.value.length
  }
}

/** 在光标位置插入表情并恢复焦点 */
function insertEmoji(item: EmojiItem) {
  // 取实际要插入输入框的文本内容
  const text = item.value
  const val = innerValue.value ?? ''
  const pos = cursorPos.value
  // 在光标处拼接表情
  const newVal = val.slice(0, pos) + text + val.slice(pos)
  innerValue.value = newVal
  // 插入后将光标移动到表情之后
  nextTick(() => {
    if (!textareaEl.value) {
      return
    }
    const newPos = pos + text.length
    textareaEl.value.focus()
    textareaEl.value.setSelectionRange(newPos, newPos)
    cursorPos.value = newPos
  })
}

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