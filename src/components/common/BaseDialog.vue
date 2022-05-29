<template>
  <v-dialog
    :width="width"
    class="base-dialog"
    :max-width="maxWidth"
    :persistent="persistent"
  >
    <loading-mask :loading="loading" />
    <v-card :title="title" color="background">
      <v-card-content style="margin-top: 12px">
        <div style="padding: 0 12px">
          <!-- 对话框默认正文内容插槽 -->
          <slot />
        </div>
      </v-card-content>

      <!-- 对话框操作按钮插槽 -->
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
const showDialog = ref()
defineProps({
  title: {
    type: String,
    default: ''
  },
  width: {
    type: [Number, String],
    default: '90%'
  },
  persistent: {
    type: Boolean,
    default: false
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
const formManager = new FormManager()
provide('formManager', formManager)
defineExpose({ formManager })
</script>

<script lang="ts">
import { FormManager } from '@/utils/FormUtils/FormManager'
import { defineComponent, ref, defineProps, onMounted, provide } from 'vue'

export default defineComponent({
  name: 'BaseDialog'
})
</script>

<style>
.base-dialog .v-overlay__content {
  width: 100% !important;
}
</style>