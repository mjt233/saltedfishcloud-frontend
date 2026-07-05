<!-- 用于展示视频类型的元数据 inlineMetadata -->
<template>
  <VTable>
    <thead>
      <tr>
        <th>名称</th>
        <th>值</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="k in Object.keys(obj)" :key="k">
        <td>{{ k }}</td>
        <td>{{ obj[k] }}</td>
      </tr>
    </tbody>
  </VTable>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: String,
    default: undefined
  }
})

const obj = computed(() => {
  if (!props.modelValue) {
    return []
  }
  return JSON.parse(props.modelValue)
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed } from 'vue'

export default defineComponent({
  name: 'DataManagerKeyValue'
})
</script>