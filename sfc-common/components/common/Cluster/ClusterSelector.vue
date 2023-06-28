<template>
  <FormSelect
    :items="nodeItems"
    placeholder="选择节点"
    :loading="loading"
    hide-details
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    @change="emit('change', $event)"
  />
</template>

<script setup lang="ts">
const nodeItems = ref([]) as Ref<SelectOption[]>
const props = defineProps({
  /**
   * 加载完成后自动选择第一个节点
   */
  autoSelect: {
    type: Boolean,
    default: true
  },
  /**
   * 是否自动加载数据
   */
  autoLoad: {
    type: Boolean,
    default: true
  },
  modelValue: {
    type: [String, Number] as PropType<IdType>,
    default: undefined
  }
})
const loading = ref(false)
const emit = defineEmits(['loaded','update:modelValue', 'change'])
const loadList = async() => {
  try {
    loading.value = true
    nodeItems.value = (await SfcUtils.request(API.admin.cluster.listNodes())).data.data.map(node => {
      return {
        title: node.host,
        value: node.id
      }
    })
    emit('loaded', nodeItems.value)
    if (props.autoSelect && nodeItems.value && !props.modelValue) {
      emit('update:modelValue', nodeItems.value[0].value)
    }
    console.log(props.modelValue)
    return nodeItems.value
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (props.autoLoad) {
    loadList()
  }
})

defineExpose({
  loadList
})
</script>

<script lang="ts">
import API from 'sfc-common/api'
import { IdType, SelectOption } from 'sfc-common/model'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'
import { FormSelect } from '..'

export default defineComponent({
  name: 'ClusterSelector',
  components: { FormSelect }
})
</script>