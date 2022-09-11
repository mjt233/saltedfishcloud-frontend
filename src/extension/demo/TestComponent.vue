<template>
  <div class="scss-test">
    <h1>
      你是一个，一个一个一个，啊~
    </h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TestComponent'
})
</script>

<style lang="scss" scoped>
.scss-test {
  background-color: #eee;
  &>h1 {
    color: red;
  }
}
</style>