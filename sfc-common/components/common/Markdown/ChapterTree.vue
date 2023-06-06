<template>
  <ul class="chapter-tree">
    <li v-for="(node, idx) in nodes" :key="node.title + node.level + idx">
      <CommonIcon
        v-if="node.child?.length"
        class="expand-icon"
        :class="{active: node.active}"
        icon="mdi-menu-right"
        @click="node.active = !node.active"
      />
      <span class="link" @click="nodeClick(node)"> 
        {{ node.title }}
      </span>
      <template v-if="node.child?.length && node.active">
        <ChapterTree :nodes="node.child" @node-click="emits('node-click', $event)" />
      </template>
    </li>
  </ul>
</template>

<script setup lang="ts">
const props = defineProps({
  nodes: {
    type: Array as PropType<ChapterTreeNode[]>,
    default: () => []
  }
})

const emits = defineEmits<{
  (e: 'node-click', v: ChapterTreeNode): void
}>()

const nodeClick = (node: ChapterTreeNode) => {
  emits('node-click', node)
  if (node.child.length) {
    node.active = true
  }
}
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { ChapterTreeNode } from './type'

export default defineComponent({
  name: 'ChapterTree'
})
</script>

<style lang="scss" scoped>
.chapter-tree {
  position: relative;
  padding-left: 20px;
  list-style: none;
  animation: up-in .2s;

}


.expand-icon {
  cursor: pointer;
  position: absolute;
  left: 0;
  transition: all .2s;

  &.active {
    transform: rotateZ(90deg);
    color: rgb(var(--v-theme-primary));
  }
}
</style>