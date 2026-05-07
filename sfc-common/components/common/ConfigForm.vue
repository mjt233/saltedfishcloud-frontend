<!-- 采用配置方式生成的表单 -->
<!-- 注意：该表单已弃用，请使用 ConfigurableForm 替代 -->
<template>
  <base-form
    ref="formRef"
    v-model="valObj"
    component-name="config-form"
    row-height="80px"
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
          :label="['text', 'select'].includes(field.inputType) ? undefined : field.title"
          class="mw-50"
          top-label
        >
          <template v-if="field.inputType == 'switch'" #label>
            <span style="position: absolute;">{{ field.title }}</span>
          </template>
          <config-node
            style="padding: 0;"
            :style="{'margin-top': field.inputType == 'switch' ? '6px' : ''}"
            :node="field"
            :show-describe="false"
            :show-title="false"
            :show-change="false"
            @change="formData[field.name] = $event;field.value = $event"
          />
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

let valObj = reactive({}) as any
const maxLabelWidth = 120

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

function initObj() {

  Object.assign(valObj, props.modelValue)
  props.groups.flatMap(e => e.nodes).forEach(node => {
    if (node) {
      node.value = formData[node?.name]
    }
  })
}

initObj()
</script>

<script lang="ts">
import { ConfigNodeModel } from 'sfc-common/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, reactive, computed, onMounted } from 'vue'
import { defineBaseForm, defineForm } from 'sfc-common/utils/FormUtils'
import { Validators } from 'sfc-common/core'

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

.v-row {
  margin-bottom: 12px;
}
</style>