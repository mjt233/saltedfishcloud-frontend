<template>
  <div class="empty-tip">
    (～￣▽￣)～{{ text }}
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
import { context } from 'sfc-common/core/context'

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