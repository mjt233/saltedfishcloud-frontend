<template>
  <a class="link" @click="showInfo">查看编译参数</a>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const showInfo = () => {
  window.SfcUtils.alert(props.modelValue, '编译参数')
}
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'ConfigureInfo'
})
</script>