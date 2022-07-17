<template>
  <v-select
    v-model="currentSelect"
    variant="underlined"
    density="comfortable"
    class="hide-details no-padding"
    color="primary"
    :items="items"
    return-object
  />
</template>

<script setup lang="ts">
const currentSelect = ref() as Ref<SelectOption | undefined>
const props = defineProps({
  items: {
    type: Array as PropType<SelectOption[] | undefined>,
    default: () => []
  },
  returnObject: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: [String, Number] as PropType<any | undefined>,
    default: undefined
  }
})
const emits = defineEmits(['change', 'update:modelValue'])
watch(currentSelect, () => {
  emits('change', currentSelect.value)
  if (props.returnObject) {
    emits('update:modelValue', currentSelect.value)
  } else {
    emits('update:modelValue', currentSelect.value?.value)
  }
  currentSelect.value?.action && currentSelect.value.action()
})
watch(() => props.modelValue, () => {
  updateCurrent()
})
const updateCurrent = () => {
  currentSelect.value = props.items?.find(e => {
    if (props.returnObject) {
      return e == props.modelValue
    } else {
      return e.value == props.modelValue
    }
  }) || props.returnObject ? {name: props.modelValue, value: props.modelValue} : props.modelValue
  currentSelect.value?.action && currentSelect.value.action()
}
updateCurrent()
</script>

<script lang="ts">
import { SelectOption } from '@/core/model/Common'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, watch } from 'vue'

export default defineComponent({
  name: 'FormSelect'
})
</script>