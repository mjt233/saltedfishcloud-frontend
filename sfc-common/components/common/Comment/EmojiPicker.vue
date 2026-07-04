<template>
  <!-- 表情选择器：根据 categories 数据动态渲染分类，点击后向外发出 select 事件 -->
  <VMenu
    v-model="menu"
    :close-on-content-click="false"
    location="top end"
    transition="slide-y-transition"
  >
    <template #activator="{ props: activatorProps }">
      <VBtn
        icon="mdi-emoticon-outline"
        variant="text"
        size="small"
        class="emoji-picker-btn flex-shrink-0"
        :disabled="disabled"
        v-bind="activatorProps"
      />
    </template>
    <VCard class="emoji-picker-card" width="320">
      <!-- 分类切换：由 categories 数据驱动 -->
      <VTabs v-model="tab" density="compact" color="primary">
        <VTab
          v-for="cat in categories"
          :key="cat.id"
          :value="cat.id"
          style="min-width: 32px;"
        >
          <!-- 图标/图片类名称用 CommonIcon 渲染，纯文本直接显示 -->
          <CommonIcon
            v-if="isIconName(cat.name)"
            :icon="cat.name"
            size="18"
            class="d-flex align-center"
          />
          <template v-else>
            {{ cat.name }}
          </template>
        </VTab>
      </VTabs>

      <VWindow v-model="tab" class="emoji-picker-window">
        <!-- 各分类内容：根据 type 渲染不同样式 -->
        <VWindowItem v-for="cat in categories" :key="cat.id" :value="cat.id">
          <div class="emoji-grid" :style="{ gridTemplateColumns: `repeat(${cat.cols ?? 8}, 1fr)` }">
            <button
              v-for="item in cat.items"
              :key="item.value"
              type="button"
              class="emoji-item"
              :class="{ 'emoji-item--text': item.type === 'text', 'emoji-item--image': item.type === 'image' }"
              :title="item.label ?? item.value"
              @click="handlePick(item)"
            >
              <!-- 图片表情 -->
              <img
                v-if="item.type === 'image'"
                :src="item.src"
                :alt="item.label ?? item.value"
                class="emoji-item-img"
              >
              <!-- 文本类表情（emoji / 颜文字 / 短句） -->
              <template v-else>
                {{ item.label ?? item.value }}
              </template>
            </button>
          </div>
        </VWindowItem>
      </VWindow>
    </VCard>
  </VMenu>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { builtinCategories, isIconName, type EmojiCategory, type EmojiItem } from './emoji-data'
import CommonIcon from '../CommonIcon.vue'

defineProps({
  /** 是否禁用表情按钮 */
  disabled: {
    type: Boolean,
    default: false
  },
  /**
   * 表情分类列表，默认使用内置分类。
   * 外部可传入自定义分类以扩展或替换内置内容。
   */
  categories: {
    type: Array as () => EmojiCategory[],
    default: () => builtinCategories
  }
})

const emit = defineEmits<{
  /** 选中某个表情时触发，payload 为该表情项 */
  (e: 'select', item: EmojiItem): void
}>()

/** 菜单展开状态 */
const menu = ref(false)
/** 当前激活的分类 id，默认取第一个分类 */
const tab = ref<string>(builtinCategories[0]?.id ?? '')

/** 选中表情后向外发出事件并关闭菜单 */
function handlePick(item: EmojiItem) {
  emit('select', item)
  menu.value = false
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'EmojiPicker'
})
</script>

<style lang="scss" scoped>
.emoji-picker-btn {
  margin-bottom: 2px;
}

.emoji-picker-card {
  display: flex;
  flex-direction: column;
}

.emoji-picker-window {
  max-height: 240px;
  overflow-y: auto;
}

/* 统一网格容器，列数由内联 style 根据 category.cols 动态设置 */
.emoji-grid {
  display: grid;
  gap: 2px;
  padding: 8px;
  /* 防止内容撑宽网格，保持各分类宽度一致 */
  min-width: 0;
  min-height: 240px;
}

.emoji-item {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.1s;
  font-size: 18px;
  line-height: 1;
  padding: 4px;
  min-height: 32px;
  /* 限制单项宽度，避免长文本撑破网格 */
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  &:hover {
    background-color: rgba(var(--v-theme-primary), 0.12);
  }
}

/* 文本类表情（颜文字 / 快捷短句）：使用等宽字体并缩小字号 */
.emoji-item--text {
  font-size: 13px;
  font-family: monospace;
}

/* 图片表情：限制图片尺寸 */
.emoji-item--image {
  padding: 2px;
}

.emoji-item-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  pointer-events: none;
}
</style>