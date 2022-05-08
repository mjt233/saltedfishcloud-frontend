<template>
  <app-login />
</template>

<script lang="ts">
import AppLogin from '@/components/AppLogin/index.vue'
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'LoginView',
  components: {
    AppLogin
  }
})
</script>