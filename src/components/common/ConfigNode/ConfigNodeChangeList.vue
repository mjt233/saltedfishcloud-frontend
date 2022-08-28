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
import ConfigNodeChangeDetail from './ConfigNodeChangeDetail.vue'
const props = defineProps({
  nodes: {
    type: Array as PropType<ConfigNodeModel[]>,
    default: () => []
  }
})

onMounted(() => {
  props.nodes.forEach(e => {
    console.log(e)
  })
})
</script>

<script lang="ts">
import { ConfigNodeModel } from '@/core/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'

export default defineComponent({
  name: 'ConfigNodeChangeList'
})
</script>