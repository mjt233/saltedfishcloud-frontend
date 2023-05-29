<template>
  <div>
    <div v-for="(item, index) in nodes" :key="item.name">
      <div style="font-weight: 600;">
        {{ item.title }}
      </div>
      <config-node-change-detail
        :node="item"
        :current-value="item.value"
      />
      <v-divider v-show="index != (nodes.length - 1)" style="margin: 12px 0" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  nodes: {
    type: Array as PropType<ConfigNodeModel[]>,
    default: () => []
  }
})
</script>

<script lang="ts">
import { ConfigNodeModel } from 'sfc-common/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'

export default defineComponent({
  name: 'ConfigNodeChangeList'
})
</script>