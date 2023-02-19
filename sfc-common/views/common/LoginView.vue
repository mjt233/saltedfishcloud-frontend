<template>
  <div style="margin: 24px auto; max-width: 480px; width: 100%;">
    <login-form ref="form" @submit="login" />
  </div>
</template>

<script setup lang="ts">
import LoginForm from 'sfc-common/components/form/LoginForm.vue'
const form = ref() as Ref<CommonForm>
const router = useRouter()
const login = async() => {
  const res = await form.value.submit()
  if (res.success) {
    const routeInfo = context.routeInfo.value
    router.push(routeInfo.prev?.path || '/personalCenter')
  }
}
</script>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue'
import { context } from 'sfc-common/core/context'
import { CommonForm } from 'sfc-common/utils/FormUtils'
import { useRouter } from 'vue-router'
export default defineComponent({
  name: 'LoginView'
})
</script>