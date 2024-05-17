<template>
  <FormGrid :style="{'max-width': maxWidth}">
    <FormRow>
      <FormCol class="mw-50">
        <VSwitch
          v-model="valueObj.enabled"
          color="primary"
          label="启用背景图"
          hide-details
        />
      </FormCol>
      <FormCol class="mw-50" label="不透明度">
        <v-slider
          style="margin-top: 12px"
          :model-value="(valueObj.operacity || 0.9)*100"
          :min="1"
          :max="100"
          :step="1"
          thumb-label
          color="primary"
          @update:model-value="valueObj.operacity = $event / 100"
        >
          <template #thumb-label="{ modelValue: v }">
            {{ v + '%' }}
          </template>
        </v-slider>
      </FormCol>
      <FormCol class="mw-50">
        <FormSelect v-model="valueObj.size" placeholder="尺寸" :items="sizeOptions" />
      </FormCol>
      <FormCol class="mw-50">
        <TextInput v-model="valueObj.url" label="图片url" hide-details />
      </FormCol>
    </FormRow>
  </FormGrid>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: [String, Object] as PropType<String | BgOption>,
    default: undefined
  },
  useJson: {
    type: Boolean,
    default: false
  },
  maxWidth: {
    type: String,
    default: '640px'
  }
})
const emits = defineEmits(['update:modelValue'])
const getDefaultObj = () => {
  return {
    enabled: false,
    operacity: 0.9,
    size: 'cover',
    url: ''
  } as BgOption
}
let valueObj: BgOption = reactive(getDefaultObj())

const sizeOptions: SelectOption[] = [
  {
    title: 'cover',
    value: 'cover'
  },
  {
    title: 'contain',
    value: 'contain'
  },
  {
    title: 'auto',
    value: 'auto'
  }
]

const initObj = () => {
  if (props.useJson) {
    Object.assign(valueObj, JSON.parse(props.modelValue as string))
  } else {
    Object.assign(valueObj, props.modelValue as BgOption)
  }
}
const emitVal = () => {
  if (props.useJson) {
    emits('update:modelValue', JSON.stringify(valueObj))
  } else {
    emits('update:modelValue', valueObj)
  }
}
watch(valueObj, e => {
  emitVal()
})

onMounted(initObj)
</script>

<script lang="ts">
import { BgOption } from 'sfc-common/core/context'
import { SelectOption } from 'sfc-common/model'
import { FormGrid, FormRow, FormCol } from '../layout'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, reactive, computed, watch, onMounted } from 'vue'

export default defineComponent({
  name: 'BgOptionEditor'
})
</script>

<style scoped>
.dense-form .v-col {
  min-width: 280px;
}
</style>