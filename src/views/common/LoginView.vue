<template>
  <div style="margin: 24px auto; max-width: 480px; width: 100%;">
    <app-login @success="success" @failed="failed" />
  </div>
</template>

<script setup lang="ts">
import AppLogin from '@/components/AppLogin/index.vue'
import { User } from '@/core/context/session'
import { useRouter } from 'vue-router'
import { context } from '@/core/context'

const router = useRouter()
const success = (userInfo: User) => {
  const routeInfo = context.routeInfo.value
  router.push(routeInfo.prev?.path || '/personalCenter')
}
const failed = (reason: string) => {
  console.log('失败原因：' + reason)
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'LoginView'
})
</script>