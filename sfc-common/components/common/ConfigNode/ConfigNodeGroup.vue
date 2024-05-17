<template>
  <div>
    <div v-for="(group, idx) in items" :key="idx" class="node-group">
      <slot name="title" :group="group">
        <template v-if="group.title || group.name">
          <span class="node-title">{{ group.title || group.name }}</span>
          <MultiLineText
            v-if="group.describe"
            style="margin-left: 12px;"
            class="tip"
            :text="group.describe"
          />
        </template>
      </slot>
      <config-node
        v-for="(node) in group.nodes"
        :key="node.name"
        :node="node"
        :class="{'template-node': node.inputType == 'template'}"
        :use-inner-label="false"
        @change="nodeValueChange(node, $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ConfigNode ,MultiLineText,StickyContainer } from 'sfc-common/components'
const props = defineProps({
  items: {
    type: Array as PropType<ConfigNodeModel[]>,
    default: () => []
  },
  useStickTitle: {
    type: Boolean,
    default: true
  }
})

const emits = defineEmits(['nodeChange'])

const nodeValueChange = (node: ConfigNodeModel, val: string) => {
  emits('nodeChange', {name: node.name, value: val})
}
</script>

<script lang="ts">
import { ConfigNodeModel } from 'sfc-common/model'
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
  /* background-color: rgb(var(--v-theme-background)); */
  width: 100%;
  transition: all .2s;
  font-weight: 600;
}

/* .node-group>*:hover,.node-title:hover {
  background-color: rgba(var(--v-theme-primary), .05);
} */

/* Vue模板组件类型的不悬浮高亮了 */
.node-group>.template-node:hover {
  background-color: transparent;
}
</style>