<template>
  <base-form
    ref="formRef"
    dense
    style="padding: 12px"
    label-width="64px"
    :model-value="formData"
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
            :rules="validators.name"
            :readonly="readonly"
          />
        </div>
      </v-col>
      <v-col>
        <div class="d-flex align-center" style="width: 100%">
          <span class="form-label">
            类型：
          </span>
          <form-select
            v-model="formData.type"
            :items="typeOptions" 
            :disabled="readonly"
          />
        </div>
      </v-col>
    </v-row>
    <v-row class="form-row" :align="'center'">
      <v-col style="max-width: 100%">
        <span class="form-label">
          描述：
        </span>
        <div class="d-flex align-center" style="width: 100%">
          <text-input
            v-model="formData.describe"
            :readonly="readonly"
          />
        </div>
      </v-col>
    </v-row>
    <v-row class="form-row" :align="'center'">
      <v-col class="mw-50">
        <div class="d-flex align-center" style="width: 100%">
          <span class="form-label">
            默认值：
          </span>
          <text-input
            v-model="formData.value"
            :readonly="readonly"
          />
        </div>
      </v-col>
      <v-col v-if="formData.type == 'TEXT'">
        <div class="d-flex align-center" style="width: 100%">
          <span class="form-label" style="max-width: 120px">
            正则约束：
          </span>
          <text-input
            v-model="formData.pattern"
            :readonly="readonly"
            :items="typeOptions"
            :rules="validators.regex"
          />
        </div>
      </v-col>
      <v-col v-if="formData.type == 'OPTION' && !readonly">
        <div class="d-flex align-center" style="width: 100%">
          <span class="form-label">候选值：</span>
          <text-input
            ref="optionEditor"
            v-model="editingOption"
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
      </v-col>
    </v-row>
    <v-row>
      <v-col>
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
      </v-col>
    </v-row>
    <v-row style="margin-top: 25px" class="form-row" :align="'center'" />
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
  font-size: 12px;
  margin-right: 6px;
  // transition: all .05s;
  &:hover {
    transform: scale(1.4);
  }
}

</style>