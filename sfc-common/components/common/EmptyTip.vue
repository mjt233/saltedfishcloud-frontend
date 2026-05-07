<template>
  <div class="empty-tip tip">
    (～￣▽￣)～{{ text }}
    <slot name="append" />
  </div>
</template>

<script setup lang="ts">
defineProps({
  text: {
    type: String,
    default: '这里什么也没有哦'
  }
})
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'EmptyTip'
})
</script>


<style scoped>
.empty-tip {
  text-align: center;
  margin: 16px 0;
  font-size: 16px;
}
</style>