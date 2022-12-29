<template>
  <div style="padding: 16px">
    <div class="d-flex align-center">
      <div><FileIcon width="36" file-name="aaa.mp4" /></div>
      <div style="padding: 0 8px">
        <div class="break-text">
          {{ params?.source?.name }}
        </div>
        <div v-if="task.progress" class="break-text">
          <VProgressLinear color="primary" :model-value="task.progress.loaded" :max="task.progress.total" />
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  task: {
    type: Object as PropType<EncodeConvertTask>,
    default() { return {} }
  }
})
const params = computed(() => {
  return JSON.parse(props.task.params || '{}') as EncodeConvertTaskParam
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed } from 'vue'
import { EncodeConvertTask, EncodeConvertTaskParam } from '../model'

export default defineComponent({
  name: 'EncodeConvertTaskInfo'
})
</script>