<template>
  <div class="not-found-tip">
    `(*>﹏&lt;*)′你要找的资源不见啦
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
.not-found-tip {
  text-align: center;
  margin: 16px 0;
  color: grey;
}
</style>