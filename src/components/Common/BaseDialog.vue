<template>
  <v-dialog v-model="showDialog" :width="width">
    <loading-mask :loading="loading" />
    <v-card :title="title" color="background">
      <v-card-content style="margin-top: 12px">
        <div style="padding: 0 12px">
          <slot />
        </div>
      </v-card-content>
      <v-card-actions class="justify-end">
        <v-btn color="primary" @click="emits('confirm')">
          确定
        </v-btn>
        <v-btn color="primary" @click="emits('cancel')">
          取消
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import LoadingMask from './LoadingMask.vue'
const showDialog = ref(false)
defineProps({
  title: {
    type: String,
    default: ''
  },
  value: {
    type: Boolean,
    default: false
  },
  width: {
    type: [Number, String],
    default: '360px'
  },
  loading: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['confirm', 'cancel', 'update:show'])
</script>

<script lang="ts">
import { defineComponent, ref, defineProps } from 'vue'

export default defineComponent({
  name: 'BaseDialog'
})
</script>