<template>
  <div class="form-select">
    <LoadingMask type="circular" :loading="loading" />
    <v-select
      v-bind="$attrs"
      v-model="currentSelect"
      style="width: 100%"
      variant="underlined"
      class="hide-details no-padding"
      :class="{'dense-select': dense}"
      color="primary"
      :items="items"
      :hide-details="hideDetails"
      return-object
      :multiple="multiple"
      :label="label || placeholder"
      :disabled="disabled"
    >
      <template #selection="{ item, index }">
        <component :is="useChip ? 'v-chip' : 'span'" v-if="!multiple || multipleShowNum == -1 || index < Number(multipleShowNum)">
          <span>{{ item.title }}</span>
        </component>
        <component
          :is="useChip ? 'v-chip' : 'span'" 
          v-if="index == multipleShowNum"
          class="text-grey text-caption align-self-center"
        >
          +{{ otherCount }}
        </component>
      </template>
    </v-select>
  </div>
</template>

<script setup lang="ts" generic="T extends SelectOption">
const currentSelect = ref() as Ref< T | undefined | T[]>
const otherCount = computed(() => {
  if (props.multiple && props.multipleShowNum != -1) {
    return (currentSelect.value as any[]).length - Number(props.multipleShowNum)
  } else {
    return 0
  }
})
const props = defineProps({
  dense: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  items: {
    type: Array as PropType<T[] | undefined>,
    default: () => []
  },
  placeholder: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  returnObject: {
    type: Boolean,
    default: false
  },
  hideDetails: {
    type: [Boolean, String] as PropType<boolean | 'auto' | undefined>,
    default: undefined
  },
  modelValue: {
    type: [String, Number, Array] as PropType<any | undefined | any[]>,
    default: undefined
  },
  /**
   * 是否使用v-chip组件显示已选值
   */
  useChip: {
    type: Boolean,
    defualt: false
  },
  /**
   * 是否多选
   */
  multiple: {
    type: Boolean,
    default: false
  },
  /**
   * 多选时显示的已选数量，-1为不限制
   */
  multipleShowNum: {
    type: [Number, String],
    default: -1
  },

})
const emits = defineEmits<{
  (e: 'change', v: T): void,
  (e: 'update:modelValue', v?: any | any[]): void
}>()


const updateCurrent = () => {
  if (props.multiple) {
    (currentSelect.value as any) = props.items?.filter(e => {
      return (props.modelValue as any[]).findIndex(e2 => {
        if (props.returnObject) {
          return e2.value == e.value
        } else {
          return e2 == e.value
        }
      }) != -1
    }) || []
  } else {
    currentSelect.value = props.items?.find(e => {
      if (props.returnObject) {
        return e.value == props.modelValue.value
      } else {
        return e.value == props.modelValue
      }
    })
  }
}

watch(() => props.items, updateCurrent)
watch(currentSelect, (oldVal, newVal) => {
  if (props.multiple) {
    const oldSet = new Set((oldVal as SelectOption[] || []).map(e => e.value))
    const newSet = new Set((newVal as SelectOption[] || []).map(e => e.value))
    if (oldSet.size == newSet.size && Array.from(oldSet).findIndex(e => !newSet.has(e)) == -1) {
      return
    }
  } else {
    const oldValue = (oldVal as SelectOption)?.value
    const newValue = (newVal as SelectOption)?.value
    if (oldValue == newValue) {
      return
    }
  }
  emits('change', currentSelect.value as T)
  if (props.returnObject) {
    emits('update:modelValue', currentSelect.value)
  } else {
    if (props.multiple) {
      const options = currentSelect.value as any as SelectOption[]
      const updateVal = options.map(e => e.value)
      emits('update:modelValue', updateVal)
      options.forEach(e => e.action && e.action())
    } else {
      const option = currentSelect.value as any as SelectOption
      emits('update:modelValue', option.value)
      option.action && option.action()
    }
    
  }
})
watch(() => props.modelValue, (newVal, oldVal) => {
  if(newVal instanceof Array && oldVal instanceof Array) {
    if (newVal.length != oldVal.length) {
      updateCurrent()  
    }
    const len = newVal.length
    for(let i = 0; i<len; i++) {
      if(newVal[i] != oldVal[i]) {
        updateCurrent()
        return
      }
    }
  } else if (newVal != oldVal) {
    updateCurrent()
  }
})

updateCurrent()
defineExpose({ updateCurrent })
</script>

<script lang="ts">
import { SelectOption } from 'sfc-common/model/Common'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, watch, defineExpose, computed } from 'vue'

export default defineComponent({
  name: 'FormSelect'
})
</script>

<style lang="scss">
.dense-select {
  .v-select__selection-text {
    top: 5px !important;
    position: relative !important;
  }
}
  
.form-select {
  width: 100%;
  position: relative;
}
</style>