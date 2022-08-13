<template>
  <div class="config-node">
    <div class="config-title">
      {{ node.title }}
    </div>
    <div class="config-describe tip">
      <v-checkbox
        v-if="node.inputType == 'switch'"
        color="primary"
        :hide-details="true"
        :label="node.describe"
        :model-value="nodeValue"
        @update:model-value="nodeValue = $event; updateValue($event)"
      />
      <multi-line-text v-else :text="node.describe" />
    </div>
    <template v-if="node.inputType == 'text'">
      <text-input
        :model-value="nodeValue"
        style="max-width: 360px; padding: 0px;"
        @update:model-value="nodeValue = $event"
        @blur="updateValue(nodeValue)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import TextInput from '../TextInput.vue'
import MultiLineText from '../MultiLineText.vue'
const props = defineProps({
  node: {
    type: Object as PropType<ConfigNodeModel>,
    default: () => { return {} }
  }
})
const nodeValue = ref()
const emits = defineEmits(['change'])

const updateValue = (val: string) => {
  if (val != props.node.value) {
    emits('change', val)
  }
  
}
onMounted(() => {
  nodeValue.value = props.node.value
})

watch(() => props.node.value, () => {
  if (props.node.value == nodeValue.value) {
    return
  }

  nodeValue.value = props.node.value
})
</script>

<script lang="ts">
import { ConfigNodeModel } from '@/core/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, watch } from 'vue'

export default defineComponent({
  name: 'ConfigNode'
})
</script>

<style scoped>
.config-title {
  font-weight: 600;
}

.config-node {
  padding: 12px;
  /* background-color: black; */
  transition: all .2s;
}
.config-node:hover {
  background-color: rgba(var(--v-theme-primary), .05);
}
</style>