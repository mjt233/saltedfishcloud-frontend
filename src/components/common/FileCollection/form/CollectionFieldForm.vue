<template>
  <base-form
    ref="formRef"
    dense
    style="padding: 12px"
    label-width="64px"
  >
    <v-row class="form-row" :align="'center'">
      <v-col>
        <div class="d-flex align-center" style="width: 100%">
          <div class="form-label">
            <span>字段名：</span>
          </div>
          <text-input
            v-model="formData.name"
            class="dense-details"
            style="margin: 12px 0 0 0"
          />
        </div>
      </v-col>
      <v-col>
        <div class="d-flex align-center" style="width: 100%">
          <span class="form-label">
            类型：
          </span>
          <form-select v-model="formData.type" :items="typeOptions" />
        </div>
      </v-col>
      <v-col>
        <div class="d-flex align-center" style="width: 100%">
          <span class="form-label">
            默认值：
          </span>
          <form-select v-model="formData.type" :items="typeOptions" />
        </div>
      </v-col>
    </v-row>
  </base-form>
</template>

<script setup lang="ts">
import BaseForm from '@/components/common/BaseForm.vue'
import TextInput from '@/components/common/TextInput.vue'
import { CollectionInfoField } from '@/core/model/FileCollection'
import { defineForm } from '@/utils/FormUtils'
import FormSelect from '@/components/common/FormSelect.vue'
const props = defineProps({
  modelValue: {
    type: Object as PropType<CollectionInfoField>,
    default: undefined
  }
})
const typeOptions: SelectOption[] = [
  {
    title: '文本输入',
    value: 'TEXT'
  },
  {
    title: '下拉选择',
    value: 'OPTION'
  }
]
const emits = defineEmits(['update:modelValue'])
const formRef = ref()

const formInst = defineForm({
  formData: {
    name: '',
    type: 'TEXT',
    describe: '',
    options: '',
    pattern: '',
    value: ''
  } as CollectionInfoField,
  actions: {},
  validators: {},
  formRef: formRef
})

const { formData, validators, actions } = formInst
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, watch } from 'vue'
import { SelectOption } from '@/core/model/Common'

export default defineComponent({
  name: 'CollectionFieldForm'
})
</script>