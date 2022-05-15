<template>
  <base-form ref="codeForm" v-model="formData">
    <text-input v-model="formData.username" label="用户名" :rules="rules.username" />
    <text-input
      v-model="formData.password"
      label="密码"
      :rules="rules.password"
      type="password"
    />
    <text-input
      v-model="formData.repeatPassword"
      type="password"
      label="确认密码"
      :rules="rules.repeatPassword"
    />
  </base-form>
</template>

<script setup lang="ts">
import TextInput from '@/components/common/TextInput.vue'
import BaseForm from '@/components/common/BaseForm.vue'

const codeForm = ref()
const formData = reactive({
  username: '',
  password: '',
  repeatPassword: ''
})
const rules = {
  username: [ Validators.notNull('用户名不能为空'),Validators.minLen('用户名不能小于3个字符', 3), Validators.maxLen('用户名不能大于24个字符', 32) ],
  password: [ Validators.notNull('密码不能为空'),Validators.minLen('密码不能小于6个字符', 6) ],
  repeatPassword: [ Validators.notNull('确认密码不能为空') ,() => formData.password == formData.repeatPassword || '确认密码与密码不一致'  ]
}
defineExpose(deconstructForm(codeForm))
</script>

<script lang="ts">
import { defineForm, deconstructForm } from '@/utils/FormUtils'
import { defineComponent, reactive, ref } from 'vue'
import { Validators } from '@/core/helper/Validators'
export default defineComponent({
  name: 'BaseRegisterForm'
})
</script>