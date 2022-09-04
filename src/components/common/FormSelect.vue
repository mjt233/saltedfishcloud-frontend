<template>
  <v-select
    v-model="currentSelect"
    variant="underlined"
    density="comfortable"
    class="hide-details no-padding"
    :class="{' dense-select': dense}"
    color="primary"
    :items="items"
    return-object
    :multiple="multiple"
    :label="placeholder"
    :disabled="disabled"
  />
</template>

<script setup lang="ts">
const currentSelect = ref() as Ref< SelectOption | undefined >
const props = defineProps({
  dense: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  items: {
    type: Array as PropType<SelectOption[] | undefined>,
    default: () => []
  },
  placeholder: {
    type: String,
    default: ''
  },
  returnObject: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: [String, Number, Array] as PropType<any | undefined | any[]>,
    default: undefined
  },
  /**
   * 是否多选
   */
  multiple: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['change', 'update:modelValue'])
watch(currentSelect, () => {
  emits('change', currentSelect.value)
  if (props.returnObject) {
    emits('update:modelValue', currentSelect.value)
  } else {
    if (props.multiple) {
      const options = currentSelect.value as any as SelectOption[]
      const updateVal = options.map(e => e.value)
      emits('update:modelValue', updateVal)
      options.forEach(e => e.action && e.action())
    } else {
      emits('update:modelValue', currentSelect.value?.value)
      currentSelect.value?.action && currentSelect.value.action()
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
updateCurrent()
defineExpose({ updateCurrent })
</script>

<script lang="ts">
import { SelectOption } from '@/core/model/Common'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, watch, defineExpose } from 'vue'

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
  
</style>