<template>
  <div>
    <div v-for="(group, idx) in items" :key="idx">
      <sticky-container :top="64" content-class="node-title" style="width: 100%">
        {{ group.name }}
      </sticky-container>
      <config-node
        v-for="(node, index) in group.nodes"
        :key="index"
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
    type: Array as PropType<ConfigNodeGroupModel[]>,
    default: () => []
  }
})

const emits = defineEmits(['nodeChange'])

const nodeValueChange = (node: ConfigNodeModel, val: string) => {
  emits('nodeChange', {name: node.name, value: val})
}
</script>

<script lang="ts">
import { ConfigNodeModel as ConfigNodeModel, ConfigNodeGroupModel } from '@/core/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'ConfigNodeGroup'
})
</script>

<style>
.node-title {
  position: relative;
  font-size: 21px;
  padding-left: 12px;
  background-color: rgb(var(--v-theme-background));
  width: 100%;
  font-weight: 600;
}

.node-title::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background-color: rgb(var(--v-theme-primary));
}
</style>