<!-- 采用配置方式生成的表单 -->
<template>
  <base-form ref="formRef" v-model="valObj">
    <template v-for="item in groups" :key="item.name">
      <div class="group-title">
        {{ item.title }}
      </div>
      <form-row>
        <form-col
          v-for="field in item.nodes"
          :key="field.name"
          :label="field.inputType == 'checkbox' ? '' : field.title"
          class="mw-50"
        >
          <template v-if="field.inputType == 'text'">
            <text-input v-model="formData[field.name]" :type="field.mask ? 'password': 'text'" />
          </template>
          <template v-if="field.inputType == 'checkbox'">
            <v-switch
              v-model="formData[field.name]"
              hide-details
              color="primary"
              :label="field.title"
            />
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

Object.assign(valObj, props.modelValue)

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
import { ConfigNodeModel } from '@/core/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, reactive } from 'vue'
import { defineBaseForm, defineForm } from '@/utils/FormUtils'

export default defineComponent({
  name: 'ConfigForm'
})
</script>

<style scoped lang="scss">
.group-title {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}
</style>