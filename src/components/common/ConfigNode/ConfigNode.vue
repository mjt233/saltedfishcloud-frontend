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
        :disabled="node.readonly"
        @update:model-value="nodeValue = $event; updateValue($event)"
      />
      <multi-line-text v-else :text="node.describe" />
    </div>
    <template v-if="node.inputType == 'text'">
      <text-input
        :model-value="nodeValue"
        class="config-simple-input"
        :readonly="node.readonly"
        @update:model-value="nodeValue = $event"
        @blur="updateValue(nodeValue)"
      />
    </template>
    <template v-if="node.inputType == 'select'">
      <form-select v-model="nodeValue" :items="selectOptions" class="config-simple-input" />
    </template>
  </div>
</template>

<script setup lang="ts">
import TextInput from '../TextInput.vue'
import MultiLineText from '../MultiLineText.vue'
import FormSelect from '../FormSelect.vue'
const props = defineProps({
  node: {
    type: Object as PropType<ConfigNodeModel>,
    default: () => { return {} }
  }
})
const nodeValue = ref('') as Ref<any>
const emits = defineEmits(['change'])

const updateValue = (val: string) => {
  if (val != props.node.value) {
    emits('change', val)
  }
  
}
onMounted(() => {
})

const selectOptions = computed(() => {
  if (props.node.inputType == 'select') {
    return props.node.options
  } else {
    return []
  }
})

const initValue = () => {
  nodeValue.value = props.node.value
}

watch(() => props.node.value, () => {
  if (props.node.value == nodeValue.value) {
    return
  }

  nodeValue.value = props.node.value
})

initValue()
</script>

<script lang="ts">
import { ConfigNodeModel } from '@/core/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, watch, computed } from 'vue'

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

.config-simple-input {
  max-width: 360px;
  padding: 0px;
}
</style>