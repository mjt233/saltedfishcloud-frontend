<template>
  <v-dialog
    :width="width"
    class="base-dialog"
    :max-width="maxWidth"
    :fullscreen="fullscreen"
    :persistent="persistent"
  >
    <loading-mask :loading="loading" />
    <div v-if="!useCard">
      <slot />
    </div>
    <v-card
      v-else
      :title="title"
      color="background"
      :class="{'dialog-card': !dense}"
    >
      <v-card-header>
        <slot name="header" />
      </v-card-header>
      <v-card-content :class="{'dense-content': dense}">
        <div>
          <!-- 对话框默认正文内容插槽 -->
          <slot />
        </div>
      </v-card-content>

      <!-- 对话框操作按钮插槽 -->
      <v-card-actions v-show="!hideBtn || $slots.actions" class="justify-end">
        <template v-if="!hideBtn">
          <v-btn v-if="showConfirm" color="primary" @click="emits('confirm')">
            确定
          </v-btn>
          <v-btn v-if="showCancel" color="primary" @click="emits('cancel')">
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
defineProps({
  showConfirm: {
    type: Boolean,
    default: true
  },
  showCancel: {
    type: Boolean,
    default: true
  },
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
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  dense: {
    type: Boolean,
    defaule: false
  },
  useCard: {
    type: Boolean,
    default: true
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

<style lang="scss">
.base-dialog .v-overlay__content {
  width: 100% !important;
}

.dialog-card {
  .v-card-content {
    margin-top: 12px;
    &>div{
      padding: 12px;
    }
  }
}
.v-card-content.dense-content {
  padding: 0;
}
</style>