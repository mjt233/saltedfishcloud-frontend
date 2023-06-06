<template>
  <div class="chapter-menu" :class="{'float-style': useFloatStyle}">
    <div class="chapter-btn-group">
      <VBtn
        v-if="!active"
        size="small"
        icon="mdi-menu"
        @click="emits('update:active', true)"
      />
      <VBtn
        v-else
        size="small"
        icon="mdi-close"
        flat
        @click="emits('update:active',false)"
      />
    </div>
    <div class="chapter" :class="{active: active, 'elevation-4': active}">
      <p class="text-h6 chapter-title">
        目录
      </p>
      <ChapterTree
        style="overflow: auto; height: calc(100% - 32px)"
        :nodes="nodes"
        @node-click="emits('chapterClick', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  /**
   * 目录是否展开
   */
  active: {
    type: Boolean,
    default: true
  },
  /**
   * 目录节点
   */
  nodes: {
    type: Array as PropType<ChapterTreeNode[]>,
    default: () => []
  },
  /**
   * 是否使用预设的浮动展示的目录样式（绝对定位）
   */
  useFloatStyle: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits<{
  /**
   * 章节目录被点击事件
   */
   (e: 'chapterClick', data: ChapterTreeNode): void,

   /**
    * 目录激活状态变更
    */
   (e: 'update:active', data: boolean): void
}>()

</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { ChapterTreeNode } from './type'
import ChapterTree from './ChapterTree.vue'

export default defineComponent({
  name: 'ChapterMenu',
  components: { ChapterTree }
})
</script>


<style lang="scss" scoped>

.chapter-menu {
  position: relative;
  margin: 6px;
  padding: 6px;
  pointer-events: none;

  &.float-style {
    position: absolute;
    height: 90%;
    width: 50%;
    z-index: 1;
    max-width: 320px;
    min-width: 120px;
    right: 12px;
    top: 12px;
  }
}

.chapter-btn-group {
  position: absolute;
  top: 6px;
  right: 6px;
  text-align: right;
  z-index: 1;
  pointer-events: all;
}

.chapter {
  height: calc(100% - 32px);
  opacity: 0;
  pointer-events: none;
  transform: translateX(12px);
  background-color: rgb(var(--v-theme-background));
  border-radius: 6px;
  pointer-events: none;
  transition: all .2s;
  &.active {
    opacity: 1;
    pointer-events: all;
    transform: translateX(0);
  }
}

.chapter-title {
  text-align: center;
}
</style>