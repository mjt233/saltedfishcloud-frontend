<template>
  <div>
    <div v-if="node.inputType != 'form'">
      {{ node.originValue }} -> {{ currentValue }}
    </div>
    <div v-else>
      <div v-for="item in fieldsDiff" :key="item.name">
        <span style="font-weight:600">{{ item.title }}</span><br>
        {{ item.before }} -> {{ item.after }}
        <v-divider />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  node: {
    type: Object as PropType<ConfigNodeModel>,
    default: () => { return {} }
  },
  currentValue: {
    type: [String, Boolean],
    default: ''
  }
})

const fieldsDiff = ref([] as {title:string, name: string, before: string, after: string}[])
const updateFormDiff = () => {
  if(props.node.inputType != 'form') {
    fieldsDiff.value = []
  } else {
    // 对于form类型，逐个key去对比差异
    const curValObj = JSON.parse(props.currentValue as string || '{}')
    const originValObj = JSON.parse(props.node.originValue as string)
    fieldsDiff.value = Object.keys(curValObj).filter(key => {
      return curValObj[key] != originValObj[key]
    }).map(key => {
      const nodeInfo = props.node.nodes?.flatMap(n => n.nodes as ConfigNodeModel[]).find(n => n.name == key)
      return {
        name: nodeInfo?.name as string,
        title: nodeInfo?.title as string,
        before: originValObj[key] as string,
        after: curValObj[key] as string
      }
    })
  }
}

watch(() => props.currentValue, () => {
  updateFormDiff()
})

onMounted(() => {
  updateFormDiff()
})
</script>

<script lang="ts">
import { ConfigNodeModel } from '@/core/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed, watch, onMounted } from 'vue'

export default defineComponent({
  name: 'ConfigNodeChangeDetail'
})
</script>