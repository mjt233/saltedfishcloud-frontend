<template>
  <base-form
    ref="formRef"
    :model-value="formData"
    :submit-action="actions.submit"
    :label-width="'80px'"
    auto-loading
  >
    <FormRow>
      <FormCol>
        <form-select v-model="formData.expiredAt" placeholder="有效期" :items="expiredOptions" />
      </FormCol>
      <FormCol>
        <div class="d-flex align-center">
          <text-input v-model="formData.extractCode" label="提取码" :rules="validators.code" />
          <v-btn size="small" style="margin-left: 18px;" @click="randomCode">
            随机
          </v-btn>
        </div>
      </FormCol>
    </FormRow>
  </base-form>
</template>

<script setup lang="ts">
import BaseForm from 'sfc-common/components/common/BaseForm.vue'
import { CommonForm, defineForm } from 'sfc-common/utils/FormUtils'
import FormSelect from '../../FormSelect.vue'
import TextInput from '../../TextInput.vue'
const formRef = ref() as Ref<CommonForm>
const props = defineProps({
  uid: {
    type: [Number, String],
    default: 0
  },
  path: {
    type: String,
    default: '/'
  },
  name: {
    type: String,
    default: undefined
  }
})
const emits = defineEmits(['submit'])
const now = new Date().getTime()
const expiredOptions: SelectOption[] = [
  {
    title: '1天',
    value: now + getSecOfDay(1) * 1000
  },
  {
    title: '7天',
    value: now + getSecOfDay(7) * 1000
  },
  {
    title: '30天',
    value: now + getSecOfDay(30) * 1000
  },
  {
    title: '永久',
    value: undefined
  }
]

const randomCode = () => {
  formData.extractCode = StringUtils.getRandomStr(4, { withNumber: true })
}
const formInst = defineForm({
  actions: {
    async submit() {
      return await SfcUtils.request(API.share.createShare(formData))
    }
  },
  formData: {
    expiredAt: expiredOptions[0].value,
    extractCode: undefined,
    name: props.name,
    path: props.path
  } as CreateShareConfig,
  formRef: formRef,
  validators: {
    code: [
      Validators.maxLen('提取码不能大于16个字符', 16)
    ]
  },
  throwError: true
})
const { formData, actions, validators } = formInst


defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { CreateShareConfig } from 'sfc-common/api/share'
import { SelectOption } from 'sfc-common/model/Common'
import { getSecOfDay } from 'sfc-common/utils/DateUtils'
import { StringUtils } from 'sfc-common/utils/StringUtils'
import { Validators } from 'sfc-common/core/helper/Validators'
import API from 'sfc-common/api'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { FormCol, FormRow } from 'sfc-common/components/layout'

export default defineComponent({
  name: 'FileShareCreateForm'
})
</script>