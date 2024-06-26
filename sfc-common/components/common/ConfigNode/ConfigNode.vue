<template>
  <div class="config-node" :class="{ 'change': hasChange }">
    <div v-if="showTitle" class="config-title">
      {{ node.title }}
    </div>
    <div class="config-content">
      <!-- 值修改时的左侧小绿条 -->
      <div v-if="showChange" class="change-flag">
        <div class="change-detail">
          <config-node-change-detail :node="node" :current-value="nodeValue" />
        </div>
      </div>
      <div class="config-describe tip">
        <multi-line-text v-if="showDescribe && node.inputType != 'switch'" :text="node.describe" />
        <v-switch
          v-if="node.inputType == 'switch'"
          color="primary"
          :hide-details="true"
          :label="node.describe"
          :model-value="nodeValue == true || nodeValue == 'true'"
          :readonly="node.readonly || readOnly"
          :rules="validators"
          @update:model-value="nodeValue = $event; updateValue($event)"
        />
      </div>
      <template v-if="node.inputType == 'text'">
        <text-input
          :rules="validators"
          :model-value="nodeValue"
          class="config-simple-input"
          :readonly="node.readonly || readOnly"
          :hide-details="dense"
          :label="useInnerLabel ? (node.title || node.name) : undefined"
          :type="node.mask ? 'password': 'text'"
          :class="{'no-margin no-padding': dense}"
          @update:model-value="nodeValue = $event;updateValue(nodeValue)"
        />
      </template>
      <template v-if="node.inputType == 'select'">
        <form-select
          v-model="nodeValue"
          :placeholder="node.title || node.value"
          :disabled="node.disabled || readOnly"
          :rules="validators"
          :items="selectOptions"
          class="config-simple-input"
          @change="nodeValue = $event.value; updateValue($event.value)"
        />
      </template>
      <template v-if="node.inputType == 'radio'">
        <v-radio-group
          :model-value="nodeValue"
          color="primary"
          inline
          :hide-details="true"
          @update:model-value="nodeValue = $event;updateValue(nodeValue)"
        >
          <v-radio
            v-for="item in node.options"
            :key="item.value"
            :value="item.value"
            :label="item.title"
          />
        </v-radio-group>
      </template>
      <template v-if="node.inputType == 'form'">
        <config-node-form-input :model-value="node.value + ''" :node="node" @update:model-value="formChange" />
      </template>
      <template v-if="node.inputType == 'template'">
        <component
          :is="node.template"
          :model-value="node.value || node.defaultValue"
          v-bind="getCustomParamsObj(node)"
          @update:model-value="emits('change', $event);updateValue($event);nodeValue = $event"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TextInput, MultiLineText, FormSelect, ConfigNodeFormInput, ConfigNodeChangeDetail } from 'sfc-common/components'
const props = defineProps({
  node: {
    type: Object as PropType<ConfigNodeModel>,
    default: () => { return {} }
  },
  showDescribe: {
    type: Boolean,
    default: true
  },
  showTitle: {
    type: Boolean,
    default: true
  },
  showChange: {
    type: Boolean,
    default: true
  },
  dense: {
    type: Boolean,
    default: false
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  /**
   * 是否使用数组组件内置的标签
   */
  useInnerLabel: {
    type: Boolean,
    default: true
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

const validators:ValidateRule[] = [
  (val) => {
    if (props.node.required) {
      if (!val) {
        return (props.node.title || props.node.name) + '不能为空！' 
      }
      return true
    } else {
      return true
    }
  }
]
const getCustomParamsObj = (node: ConfigNodeModel) => {
  const obj:any = {
    node
  }
  if(node.params) {
    Object.assign(obj, node.params)
  }
  return obj

}

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
import { ConfigNodeModel } from 'sfc-common/model'
import { ValidateRule } from 'sfc-common/model/component/type'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, watch, computed, readonly } from 'vue'

export default defineComponent({
  name: 'ConfigNode'
})
</script>

<style lang="scss" scoped>
.config-title {
  font-weight: bold;
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
    z-index: 1000;
  }
  &.change .change-flag:hover {
    left: 0;
    width: 6px;
  }
}

.config-simple-input {
  max-width: 360px;
}
</style>