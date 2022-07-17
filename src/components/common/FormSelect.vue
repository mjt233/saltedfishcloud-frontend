<template>
  <v-select
    v-model="currentSelect"
    variant="underlined"
    density="comfortable"
    class="hide-details no-padding"
    color="primary"
    :items="items"
    return-object
    :multiple="multiple"
    :label="placeholder"
  />
</template>

<script setup lang="ts">
const currentSelect = ref() as Ref< SelectOption | undefined >
const props = defineProps({
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
      emits('update:modelValue', options.map(e => e.value))
      options.forEach(e => e.action && e.action())
    } else {
      emits('update:modelValue', currentSelect.value?.value)
      currentSelect.value?.action && currentSelect.value.action()
    }
    
  }
})
const updateCurrent = () => {
  const selectObjs = props.items?.filter(e => {
    if (props.returnObject) {
      return e == props.modelValue
    } else {
      return e.value == props.modelValue
    }
  }) || []
  if (props.multiple) {
    (currentSelect.value as any) = selectObjs
  } else {
    const optObj = selectObjs.length ? selectObjs[0] : props.modelValue
    currentSelect.value = optObj
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