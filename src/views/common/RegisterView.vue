<template>
  <div style="max-width: 470px;margin: 24px auto">
    <user-register-form ref="form" @submit="submit" />
  </div>
</template>

<script setup lang="ts">
import UserRegisterForm from '@/components/Form/UserRegisterForm/UserRegisterForm.vue'
import { DefineForm } from '@/utils/FormUtils'
import SfcUtils from '@/utils/SfcUtils'
const form = ref() as Ref<DefineForm>

const submit = async() => {
  try {
    await form.value.submit()
    SfcUtils.snackbar('好耶~注册成功~ ヾ(≧▽≦*)o', 5000, { showClose: true })
    context.routeInfo.value.router?.push('/login')
  } catch(err) {
    SfcUtils.snackbar((err as any).toString())
  }
}
</script>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue'
import { context } from '@/core/context'

export default defineComponent({
  name: 'RegisterView'
})
</script>