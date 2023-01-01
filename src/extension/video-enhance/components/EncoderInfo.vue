<template>
  <a class="link" @click="showInfo">查看详情({{ modelValue.length }}个)</a>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Array as PropType<Encoder[]>,
    default: () => []
  }
})

const showInfo = () => {
  window.SfcUtils.openComponentDialog(EncoderInfoList, {
    props: {
      modelValue: props.modelValue
    },
    title: '编码器详情'
  })
}
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { Encoder } from '../model'
import EncoderInfoList from './EncoderInfoList.vue'

export default defineComponent({
  name: 'EncoderInfo'
})
</script>