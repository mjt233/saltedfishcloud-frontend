<template>
  <div style="margin: 12px 0" class="dense-form">
    <v-row>
      <form-col label="状态" cols="3">
        <VSwitch
          v-model="valueObj.enabled"
          color="primary"
          label="是否启用"
          hide-details
        />
      </form-col>
    </v-row>
    <v-row>
      <form-col label="图片url" cols="4">
        <TextInput v-model="valueObj.url" hide-details />
      </form-col>
    </v-row>
    <v-row>
      <form-col label="不透明度" cols="2">
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
      </form-col>
      <form-col label="尺寸" cols="2">
        <FormSelect v-model="valueObj.size" :items="sizeOptions" />
      </form-col>
    </v-row>
  </div>
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
import { BgOption } from '@/core/context'
import { SelectOption } from '@/core/model'
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