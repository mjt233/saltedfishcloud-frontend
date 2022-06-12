<template>
  <div class="empty-tip">
    (～￣▽￣)～这里什么也没有哦
  </div>
</template>

<script setup lang="ts">
const session = context.session
</script>

<script lang="ts">
import { defineComponent } from 'vue'
import { context } from '@/core/context'

export default defineComponent({
  name: 'EmptyTip'
})
</script>


<style scoped>
.empty-tip {
  text-align: center;
  margin: 16px 0;
  color: grey;
}
</style>