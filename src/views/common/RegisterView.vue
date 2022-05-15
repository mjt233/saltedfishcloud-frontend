<template>
  <div style="max-width: 470px;margin: 24px auto">
    <user-register-form ref="form" @submit="submit" />
  </div>
</template>

<script setup lang="ts">
import UserRegisterForm from '@/components/Form/UserRegisterForm/UserRegisterForm.vue'
import { CommonForm } from '@/utils/FormUtils'
import SfcUtils from '@/utils/SfcUtils'
const form = ref() as Ref<CommonForm>
const submit = async() => {
  if((await form.value.submit()).success) {
    SfcUtils.snackbar('好耶~注册成功~ ヾ(≧▽≦*)o', 5000, { showClose: true })
    context.routeInfo.value.router?.push('/login')
  }
}
</script>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue'
import { context } from '@/core/context'

export default defineComponent({
  name: 'RegisterView'
})
</script>