<template>
  <div class="not-found-tip">
    `(*>﹏&lt;*)′{{ text }}
  </div>
</template>

<script setup lang="ts">
defineProps({
  text: {
    type: String,
    default: '你要找的资源不见啦'
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps } from 'vue'
import { context } from 'sfc-common/core/context'

export default defineComponent({
  name: 'EmptyTip'
})
</script>


<style scoped>
.not-found-tip {
  text-align: center;
  margin: 16px 0;
  color: grey;
}
</style>