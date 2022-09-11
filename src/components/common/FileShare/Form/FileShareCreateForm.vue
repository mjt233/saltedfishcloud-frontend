<template>
  <base-form
    ref="formRef"
    :model-value="formData"
    :submit-action="actions.submit"
    :label-width="'80px'"
    auto-loading
  >
    <v-row class="form-row">
      <v-col>
        <span class="form-label">有效期：</span>
        <form-select v-model="formData.expiredAt" :items="expiredOptions" />
      </v-col>
      <v-col>
        <span class="form-label">提取码：</span>
        <text-input v-model="formData.extractCode" :rules="validators.code" />
        <v-btn size="small" style="margin-left: 18px;" @click="randomCode">
          随机
        </v-btn>
      </v-col>
    </v-row>
  </base-form>
</template>

<script setup lang="ts">
import BaseForm from '@/components/common/BaseForm.vue'
import { CommonForm, defineForm } from '@/utils/FormUtils'
import FormSelect from '../../FormSelect.vue'
import TextInput from '../../TextInput.vue'
const formRef = ref() as Ref<CommonForm>
const props = defineProps({
  uid: {
    type: Number,
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
import { CreateShareConfig } from '@/api/share'
import { SelectOption } from '@/core/model/Common'
import { getSecOfDay } from '@/utils/DateUtils'
import { StringUtils } from '@/utils/StringUtils'
import { Validators } from '@/core/helper/Validators'
import API from '@/api'
import SfcUtils from '@/utils/SfcUtils'

export default defineComponent({
  name: 'FileShareCreateForm'
})
</script>