<template>
  <div style="margin: 24px auto; max-width: 480px; width: 100%;">
    <app-login @success="success" @failed="failed" />
  </div>
</template>

<script setup lang="ts">
import AppLogin from '@/components/AppLogin/index.vue'

const success = (token: string) => {
  console.log('token' + token)
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