<template>
  <VTable v-if="modelValue && modelValue.length">
    <thead>
      <tr>
        <th style="width: 90px">
          编码器
        </th>
        <th>描述</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in modelValue" :key="item.name">
        <td class="break-text">
          {{ item.name }}
        </td>
        <td>{{ item.describe }}</td>
      </tr>
    </tbody>
  </VTable>
  <EmptyTip v-else />
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Array as PropType<Encoder[]>,
    default: () => []
  }
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { Encoder } from '../model'

export default defineComponent({
  name: 'EncoderInfoList'
})
</script>