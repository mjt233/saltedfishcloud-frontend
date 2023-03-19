<template>
  <base-dialog :title="title" :persistent="persistent">
    <div v-for="line in (message || '').split('\n')" :key="line">
      {{ line }}
    </div>
    <template #actions>
      <v-btn color="primary" @click="emit('update:modelValue', false)">
        确定
      </v-btn>
    </template>
  </base-dialog>
</template>

<script setup lang="ts">
import BaseDialog from './BaseDialog.vue'
defineProps({
  message: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: '提示'
  },
  persistent: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:modelValue'])
</script>

<script lang="ts">
import { defineComponent,defineProps, defineEmits } from 'vue'

export default defineComponent({
  name: 'AlertDialog'
})
</script>