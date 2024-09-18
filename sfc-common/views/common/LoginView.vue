<template>
  <div style="margin: 24px auto; max-width: 480px; width: 100%;">
    <login-form ref="form" @submit="login" @success="doLoginSuccess" />
  </div>
</template>

<script setup lang="ts">
import LoginForm from 'sfc-common/components/form/LoginForm.vue'
const form = ref() as Ref<CommonForm>
const router = useRouter()
const login = async() => {
  await form.value.submit()
}
const doLoginSuccess = () => {
  const routeInfo = context.routeInfo.value
  router.push(routeInfo.prev?.path || '/personalCenter')
  SfcUtils.snackbar('登录成功')
}
</script>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue'
import { context } from 'sfc-common/core/context'
import { CommonForm } from 'sfc-common/utils/FormUtils'
import { useRouter } from 'vue-router'
import SfcUtils from 'sfc-common/utils/SfcUtils'
export default defineComponent({
  name: 'LoginView'
})
</script>