<template>
  <VCard v-if="useCard">
    <VCardTitle>视频转码任务</VCardTitle>
    <VCardText>
      <EncodeConvertTaskNoCard :uid="uid" />
    </VCardText>
  </VCard>
  <EncodeConvertTaskNoCard v-else :uid="uid" />
</template>

<script setup lang="ts">
const props = defineProps({
  uid: {
    type: [String, Number],
    default: 0
  },
  useCard: {
    type: Boolean,
    default: true
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import EncodeConvertTaskNoCard from './EncodeConvertTaskNoCard.vue'

export default defineComponent({
  name: 'EncoderConvertTask'
})
</script>