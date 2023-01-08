<template>
  <div>
    <div v-if="!node.nodes?.length">
      {{ node.originValue }} -> {{ currentValue }}
    </div>
    <div v-else>
      <div v-for="(item, index) in fieldsDiff" :key="item.name">
        <span style="font-weight:600">{{ item.title }}</span><br>
        <span class="break-text">{{ item.before }} -> {{ item.after }}</span>
        <v-divider v-show="index != (fieldsDiff.length - 1)" style="margin: 12px 0" />
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
    type: [Number, Boolean, String] as PropType<RawType>,
    default: ''
  }
})

const fieldsDiff = ref([] as {title:string, name: string, before: string, after: string}[])
const updateFormDiff = () => {
  if(!props.node.nodes?.length) {
    fieldsDiff.value = []
  } else {
    // 对于form类型，逐个key去对比差异
    const curValObj = StringUtils.parseJSON(props.currentValue as string || '{}')
    const originValObj = StringUtils.parseJSON((props.node.originValue || props.node.originValue) as string)
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
import { ConfigNodeModel, RawType } from '@/core/model'
import { StringUtils } from '@/utils/StringUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed, watch, onMounted } from 'vue'

export default defineComponent({
  name: 'ConfigNodeChangeDetail'
})
</script>