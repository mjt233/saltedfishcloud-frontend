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
          <text-input v-model="formData.value" :items="typeOptions" />
        </div>
      </v-col>
      <v-col v-if="formData.type == 'TEXT'">
        <div class="d-flex align-center" style="width: 100%">
          <span class="form-label" style="max-width: 120px">
            正则约束：
          </span>
          <text-input v-model="formData.pattern" :items="typeOptions" />
        </div>
      </v-col>
    </v-row>
    <v-row class="form-row">
      <v-col v-if="formData.type == 'OPTION'">
        <div class="d-flex align-center" style="width: 100%">
          <span>候选值：</span>
          <text-input
            ref="optionEditor"
            v-model="editingOption"
            :items="typeOptions"
            style="width: 120px;margin-top: 0;margin-bottom: 12px;"
            hide-details
            :rules="validators.optionEditor"
            @enter="addOption"
          />
          <v-btn
            size="small"
            style="margin:0 12px"
            @click="addOption"
          >
            <v-icon icon="mdi-plus" />
            添加
          </v-btn>
          
        </div>
      </v-col>
    </v-row>
    <v-row>
      <span v-for="(option,index) in formData.options" :key="index" style="min-width: ;">
        <v-chip color="primary" style="margin: 6px">
          {{ option }}
          <v-icon class="option-chip" icon="mdi-close" @click="removeOption(index)" />
        </v-chip>
      </span>
    </v-row>
  </base-form>
</template>

<script setup lang="ts">
import BaseForm from '@/components/common/BaseForm.vue'
import TextInput from '@/components/common/TextInput.vue'
import { CollectionInfoField } from '@/core/model/FileCollection'
import { defineForm } from '@/utils/FormUtils'
import FormSelect from '@/components/common/FormSelect.vue'
const optionEditor = ref() as Ref<TextInputModel>
const props = defineProps({
  modelValue: {
    type: Object as PropType<CollectionInfoField>,
    default: undefined
  }
})
const typeOptions: SelectOption[] = [
  {
    title: '文本输入',
    value: 'TEXT',
    action() {
      formData.options = []
    }
  },
  {
    title: '下拉选择',
    value: 'OPTION',
    action() {
      formData.pattern = ''
    }
  }
]
const addOption = async() => {
  const result = await optionEditor.value.validate()
  console.log(result)
  if (!result.valid) {
    SfcUtils.snackbar(result.errors[0].errorMessages)
    return
  }
  formData.options.push(editingOption.value)
  editingOption.value = ''
}
const removeOption = (i: number) => {
  formData.options.splice(i, 1)
}

const emits = defineEmits(['update:modelValue'])
const formRef = ref()
const editingOption = ref('')

const formInst = defineForm({
  formData: {
    name: '',
    type: 'TEXT',
    describe: '',
    options: [],
    pattern: '',
    value: ''
  } as CollectionInfoField,
  actions: {},
  validators: {
    optionEditor: [Validators.notNull('不能为空')]
  },
  formRef: formRef
})

const { formData, validators, actions } = formInst
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, watch } from 'vue'
import { SelectOption } from '@/core/model/Common'
import { TextInputModel } from '@/core/model/component/FormModel'
import SfcUtils from '@/utils/SfcUtils'
import { Validators } from '@/core/helper/Validators'

export default defineComponent({
  name: 'CollectionFieldForm'
})
</script>


<style lang="scss">
.option-chip {
  cursor: pointer;
  margin: 6px;
  font-size: 12px;
  // transition: all .05s;
  &:hover {
    font-size: 18px;
    margin: 3px;
  }
}

</style>