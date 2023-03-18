<template>
  <div class="d-flex align-center">
    <VProgressCircular style="margin-right: 12px" indeterminate color="primary" />
    <div>
      {{ msg }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  persistent: {
    type: Boolean,
    default: true
  },
  msg: {
    type: String,
    default: '加载中'
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'LoadingDialog'
})
</script>