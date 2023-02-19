<!-- 采用配置方式生成的表单 -->
<template>
  <base-form
    ref="formRef"
    v-model="valObj"
    row-height="56px"
    :label-width="labelWidth"
  >
    <template v-for="item in groups" :key="item.name">
      <div class="group-title">
        {{ item.title }}
      </div>
      <form-row>
        <form-col
          v-for="field in item.nodes"
          :key="field.name"
          :label="field.title"
          class="mw-50"
        >
          <template v-if="field.inputType == 'text'">
            <text-input v-model="formData[field.name]" :type="field.mask ? 'password': 'text'" />
          </template>
          <template v-else-if="field.inputType == 'switch'">
            <v-switch
              v-model="formData[field.name]"
              hide-details
              color="primary"
            />
          </template>
          <template v-else>
            <config-node :show-describe="false" :node="field" @change="formData[field.name] = $event" />
          </template>
        </form-col>
      </form-row>
    </template>
  </base-form>
</template>

<script setup lang="ts">
import BaseForm from './BaseForm.vue'
import FormRow from '../layout/FormRow.vue'
import FormCol from '../layout/FormCol.vue'
import ConfigNode from './ConfigNode/ConfigNode.vue'
import TextInput from './TextInput.vue'
const formRef = ref()
const props = defineProps({
  groups: {
    type: Array as PropType<ConfigNodeModel[]>,
    default: () => []
  },
  modelValue: {
    type: Object,
    default: () => {
      return {}
    }
  }
})

const valObj = {} as any
const maxLabelWidth = 120

Object.assign(valObj, props.modelValue)

const labelWidth = computed(() => {
  let currentWidth = 0
  props.groups.flatMap(e => e.nodes).forEach(e => {
    const width = ((e?.title.length || 0) * 16)
    if (currentWidth < width) {
      currentWidth = width
    }
  })
  return (currentWidth > maxLabelWidth ? maxLabelWidth : currentWidth) + 'px'
})

const form = defineForm({
  actions: {},
  formData: valObj,
  formRef: formRef,
  validators: {}
})

const { formData } = form

defineExpose(form)
</script>

<script lang="ts">
import { ConfigNodeModel } from 'sfc-common/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, reactive, computed } from 'vue'
import { defineBaseForm, defineForm } from 'sfc-common/utils/FormUtils'

export default defineComponent({
  name: 'ConfigForm'
})
</script>

<style scoped lang="scss">
.group-title {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
  margin-bottom: 12px;
  padding: 12px 0 6px 0;
}
</style>