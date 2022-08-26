<template>
  <div>
    <div v-for="(group, idx) in items" :key="idx" class="node-group">
      <sticky-container :top="64" content-class="node-title" style="width: 100%">
        {{ group.title || group.name }}
      </sticky-container>
      <config-node
        v-for="(node) in group.nodes"
        :key="node.name"
        :node="node"
        @change="nodeValueChange(node, $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ConfigNode from './ConfigNode.vue'
import StickyContainer from '../StickyContainer.vue'
const props = defineProps({
  items: {
    type: Array as PropType<ConfigNodeModel[]>,
    default: () => []
  }
})

const emits = defineEmits(['nodeChange'])

const nodeValueChange = (node: ConfigNodeModel, val: string) => {
  emits('nodeChange', {name: node.name, value: val})
}
</script>

<script lang="ts">
import { ConfigNodeModel } from '@/core/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'ConfigNodeGroup'
})
</script>

<style>
.node-title {
  position: relative;
  font-size: 23px;
  padding: 6px 12px;
  background-color: rgb(var(--v-theme-background));
  width: 100%;
  transition: all .2s;
  font-weight: 600;
}

.node-group>*:hover,.node-title:hover {
  background-color: rgba(var(--v-theme-primary), .05);
}
</style>