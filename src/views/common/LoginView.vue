<template>
  <div style="margin: 24px auto; max-width: 480px; width: 100%;">
    <login-form ref="form" @submit="login" />
  </div>
</template>

<script setup lang="ts">
import LoginForm from '@/components/Form/LoginForm.vue'
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
import { context } from '@/core/context'
import { CommonForm } from '@/utils/FormUtils'
import { useRouter } from 'vue-router'
export default defineComponent({
  name: 'LoginView'
})
</script>