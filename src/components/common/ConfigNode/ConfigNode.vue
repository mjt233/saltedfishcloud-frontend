<template>
  <div class="config-node" :class="{ 'change': hasChange }">
    <div class="config-title">
      {{ node.title }}
    </div>
    <div class="config-content">
      <!-- 值修改时的左侧小绿条 -->
      <div class="change-flag">
        <div class="change-detail">
          <config-node-change-detail :node="node" :current-value="nodeValue" />
        </div>
      </div>
      <div class="config-describe tip">
        <v-checkbox
          v-if="node.inputType == 'switch'"
          color="primary"
          :hide-details="true"
          :label="node.describe"
          :model-value="nodeValue == true || nodeValue == 'true'"
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
          :type="node.mask ? 'password': 'text'"
          @update:model-value="nodeValue = $event;updateValue(nodeValue)"
        />
      </template>
      <template v-if="node.inputType == 'select'">
        <form-select
          v-model="nodeValue"
          :items="selectOptions"
          class="config-simple-input"
          @change="nodeValue = $event.value; updateValue($event.value)"
        />
      </template>
      <template v-if="node.inputType == 'form'">
        <config-node-form-input :model-value="node.value + ''" :node="node" @update:model-value="formChange" />
      </template>
      <template v-if="node.inputType == 'template'">
        <component :is="node.template" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import TextInput from '../TextInput.vue'
import MultiLineText from '../MultiLineText.vue'
import FormSelect from '../FormSelect.vue'
import ConfigNodeFormInput from './ConfigNodeFormInput.vue'
import ConfigNodeChangeDetail from './ConfigNodeChangeDetail.vue'
const props = defineProps({
  node: {
    type: Object as PropType<ConfigNodeModel>,
    default: () => { return {} }
  }
})
const nodeValue = ref('') as Ref<any>
const emits = defineEmits(['change'])

const selectOptions = computed(() => {
  if (props.node.inputType == 'select') {
    return props.node.options
  } else {
    return []
  }
})

/**
 * 值是否被修改过
 */
const hasChange = ref(false)

const updateValue = (val: string) => {
  if (val != props.node.value) {
    emits('change', val)
  }
  if (props.node.originValue + '' != props.node.value + '') {
    hasChange.value = true
  } else {
    hasChange.value = false
  }
}

const formChange = (newVal: string) => {
  nodeValue.value = newVal
  updateValue(newVal)
}


const initValue = () => {
  nodeValue.value = props.node.value
}

watch(() => props.node.value, () => {
  updateValue(props.node.value as string)
})

onMounted(() => {
  initValue()
  updateValue(nodeValue.value)
})

</script>

<script lang="ts">
import { ConfigNodeModel } from '@/core/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, watch, computed } from 'vue'

export default defineComponent({
  name: 'ConfigNode'
})
</script>

<style lang="scss" scoped>
.config-title {
  font-weight: 600;
  color: rgba(var(--v-theme-primary));
}

.config-node {
  padding: 12px;
  position: relative;
  transition: all .2s;

  .change-flag {
    position: absolute;
    top: 0;
    left: 3px;
    width: 0px;
    height: 100%;
    cursor: pointer;
    background-color: rgb(var(--v-theme-success));
    transition: all .1s;

    &>.change-detail {
      margin: 0;
      width: 640px;
      max-height: 100%;
      overflow-y: auto;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      opacity: 0;
      transition: all .1s;
      pointer-events: none;
    }
    &:hover>.change-detail {
      padding: 6px 12px;
      margin-left: 6px;
      z-index: 100;
      pointer-events: all;
      opacity: 1;
      background-color: rgb(var(--v-theme-background));
      box-shadow: 0px 0px 5px 1px rgb(var(--v-theme-success));
    }
  }

  &.change .change-flag {
    left: 3px;
    width: 3px;
  }
  &.change .change-flag:hover {
    left: 0;
    width: 6px;
  }
}

.config-simple-input {
  max-width: 360px;
  padding: 0px;
}
</style>