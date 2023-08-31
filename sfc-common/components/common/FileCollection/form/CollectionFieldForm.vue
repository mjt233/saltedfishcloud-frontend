<template>
  <base-form
    ref="formRef"
    dense
    style="padding: 12px"
    label-width="64px"
    :model-value="formData"
  >
    <FormRow>
      <FormCol>
        <text-input
          v-model="formData.name"
          label="字段名"
          class="dense-details"
          :rules="validators.name"
          :readonly="readonly"
        />
      </FormCol>
      <FormCol>
        <FormSelect
          v-model="formData.type"
          placeholder="类型"
          :items="typeOptions" 
          :disabled="readonly"
        />
      </FormCol>
    </FormRow>
    <FormRow>
      <FormCol>
        <text-input
          v-model="formData.describe"
          label="描述"
          :readonly="readonly"
        />
      </FormCol>
    </FormRow>
    <FormRow>
      <FormCol class="mw-50">
        <text-input
          v-model="formData.value"
          label="默认值"
          :readonly="readonly"
        />
      </FormCol>
      <FormCol v-if="formData.type == 'TEXT'">
        <text-input
          v-model="formData.pattern"
          label="正则约束"
          :readonly="readonly"
          :items="typeOptions"
          :rules="validators.regex"
        />
      </FormCol>
      <FormCol v-if="formData.type == 'OPTION' && !readonly">
        <div class="d-flex align-center" style="width: 100%">
          <text-input
            ref="optionEditor"
            v-model="editingOption"
            label="候选值"
            :items="typeOptions"
            style="width: 120px;margin-top: 0;margin-bottom: 12px;"
            hide-details
            :readonly="readonly"
            @enter="addOption"
          />
          <v-btn
            v-if="!readonly"
            size="small"
            style="margin:0 12px"
            @click="addOption"
          >
            <v-icon icon="mdi-plus" />
            添加
          </v-btn>
        </div>
      </FormCol>
    </FormRow>
    <FormRow v-if="formData.type == 'OPTION'">
      <FormCol class="elevation-2" style="height: auto;max-height: 240px;">
        <div style="height: 100%; overflow: auto">
          <span v-for="(option,index) in formData.options" :key="index" style="min-width: ;">
            <v-chip color="primary" style="margin: 6px">
              <v-icon 
                v-if="!readonly"
                class="option-chip"
                icon="mdi-close"
                @click="removeOption(index)"
              />
              {{ option }}
            </v-chip>
          </span>
        </div>
      </FormCol>
    </FormRow>
  </base-form>
</template>

<script setup lang="ts">
import BaseForm from 'sfc-common/components/common/BaseForm.vue'
import TextInput from 'sfc-common/components/common/TextInput.vue'
import { CollectionInfoField } from 'sfc-common/model/FileCollection'
import { defineForm } from 'sfc-common/utils/FormUtils'
import FormSelect from 'sfc-common/components/common/FormSelect.vue'
const optionEditor = ref() as Ref<TextInputModel>
const props = defineProps({
  /**
   * 初始值
   */
  initValue: {
    type: Object as PropType<CollectionInfoField>,
    default: undefined
  },
  readonly: {
    type: Boolean,
    default: false
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
const addOption = () => {
  const res = Validators.notNull('候选值不能为空')(editingOption.value)
  if (res !== true) {
    SfcUtils.snackbar(res)
    return
  }
  if(formData.options.findIndex(e => e == editingOption.value) != -1) {
    SfcUtils.snackbar('该值已存在，不能重复添加')
    return
  }
  formData.options.push(editingOption.value)
  editingOption.value = ''
}
const removeOption = (i: number) => {
  formData.options.splice(i, 1)
}
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
    name: [Validators.notNull('字段名称不能为空')],
    regex: [Validators.isRegex()]
  },
  formRef: formRef
})

const { formData, validators, actions, getFormData } = formInst
defineExpose(formInst)

onMounted(() => {
  if (props.initValue) {
    Object.assign(formData, props.initValue)
    if (props.initValue.options) {
      formData.options = []
      props.initValue.options.forEach(e => {
        formData.options.push(e)
      })
    }
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, watch, onMounted } from 'vue'
import { SelectOption } from 'sfc-common/model/Common'
import { TextInputModel } from 'sfc-common/model/component/FormModel'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { Validators } from 'sfc-common/core/helper/Validators'
import { FormRow, FormCol } from 'sfc-common/components/layout'

export default defineComponent({
  name: 'CollectionFieldForm'
})
</script>


<style lang="scss">
.option-chip {
  cursor: pointer;
  font-size: 12px;
  margin-right: 6px;
  // transition: all .05s;
  &:hover {
    transform: scale(1.4);
  }
}

</style>