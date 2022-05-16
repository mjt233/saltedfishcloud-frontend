<template>
  <v-dialog
    v-model="showDialog"
    :width="width"
    class="base-dialog"
    :max-width="maxWidth"
  >
    <loading-mask :loading="loading" />
    <v-card :title="title" color="background">
      <v-card-content style="margin-top: 12px">
        <div style="padding: 0 12px">
          <slot />
        </div>
      </v-card-content>
      <v-card-actions v-show="!hideBtn || $slots.actions" class="justify-end">
        <template v-if="!hideBtn">
          <v-btn color="primary" @click="emits('confirm')">
            确定
          </v-btn>
          <v-btn color="primary" @click="emits('cancel')">
            取消
          </v-btn>
        </template>
        <slot name="actions" />
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
    default: '100%'
  },
  loading: {
    type: Boolean,
    default: false
  },
  /**
   * 隐藏默认按钮
   */
  hideBtn: {
    type: Boolean,
    default: false
  },
  maxWidth: {
    type: [Number, String],
    default: '640px'
  }
})
const emits = defineEmits(['confirm', 'cancel', 'update:show'])
</script>

<script lang="ts">
import { defineComponent, ref, defineProps, onMounted } from 'vue'

export default defineComponent({
  name: 'BaseDialog'
})
</script>

<style>
.base-dialog .v-overlay__content {
  width: 100% !important;
}
</style>