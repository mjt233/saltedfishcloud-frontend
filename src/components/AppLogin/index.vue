<template>
  <div>
    <h1>登录组件</h1>
    <h1>{{ test }}</h1>
  </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AppLogin',
  props: {
    test: {
      type: String,
      default: null
    }
  }
})
</script>