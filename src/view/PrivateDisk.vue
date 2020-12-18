<template>
  <container>
      <h1>未开发</h1>
  </container>
</template>

<script>
import mdui from 'mdui'
import Container from '../components/Container.vue'
export default {
  components: { Container },
  mounted() {
    if (!localStorage.token) {
      mdui.alert('请先登录再访问此页面')
    }
  }
}
</script>

<style scope>
</style>