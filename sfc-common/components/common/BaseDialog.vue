<template>
  <v-dialog
    :width="width"
    class="base-dialog"
    :max-width="maxWidth"
    :fullscreen="fullscreen"
    :persistent="persistent"
    :model-value="modelValue"
    @update:model-value="emits('update:modelValue', $event)"
  >
    <loading-mask ref="loadingMaskRef" :loading="loading || loadingRef" />
    <div v-if="!useCard">
      <slot />
    </div>
    <v-card
      v-else
      :title="title"
      color="background"
      :class="{'dialog-card': !dense}"
    >
      <template v-if="$slots.header" #title>
        <slot name="header" />
      </template>
      <v-card-text style="overflow: auto" :class="{'dense-content': dense}" :style="{'maxHeight': contentMaxHeight}">
        <!-- 对话框默认正文内容插槽 -->
        <slot />
      </v-card-text>

      <!-- 对话框操作按钮插槽 -->
      <v-card-actions v-show="!hideBtn || $slots.actions" class="justify-end">
        <template v-if="!hideBtn">
          <v-btn v-if="showConfirm" color="primary" @click="emits('confirm')">
            {{ confirmText }}
          </v-btn>
          <v-btn v-if="showCancel" color="primary" @click="emits('cancel')">
            {{ cancelText }}
          </v-btn>
        </template>
        <slot name="actions" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import LoadingMask from './LoadingMask.vue'
const props = defineProps({
  showConfirm: {
    type: Boolean,
    default: true
  },
  /**
   * 是否显示对话框
   */
  modelValue: {
    type: Boolean,
    default: false
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
  },
  /**
   * 内容最大高度
   */
  contentMaxHeight: {
    type: String,
    default: 'none'
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  }
})
const loadingMaskRef = ref<InstanceType<typeof LoadingMask>>()
const emits = defineEmits(['confirm', 'cancel', 'update:modelValue'])
const loadingManager = new LoadingManager()
const loadingRef = loadingManager.getLoadingRef()
const formManager = new FormManager()
provide('formManager', formManager)
defineExpose({
  formManager,
  beginLoading: () => loadingManager.beginLoading(),
  closeLoading: () => loadingManager.closeLoading()
} as DialogModel )

watch(() => props.modelValue, () => {
  // 当对话框关闭时，利用LoadingMask组件实例的$el向上找到VDialog的DOM，进而找到.v-overlay__scrim
  // 给.v-overlay__scrim添加CSS属性 - opacity: 0 实现关闭时自动过渡效果而不是突然消失
  if (loadingMaskRef.value) {
    const overlayScrim = DOMUtils.getElParentByClass(loadingMaskRef.value.$el, 'v-dialog')?.querySelector('.v-overlay__scrim')
    if (overlayScrim) {
      (overlayScrim as HTMLElement).style.opacity = '0'
    }
  }
})
</script>

<script lang="ts">
import { DOMUtils, FormManager } from 'sfc-common/utils'
import { defineComponent, ref, defineProps, provide } from 'vue'
import { LoadingManager } from 'sfc-common/utils'
import { DialogModel } from 'sfc-common/model/component/DialogModel'
import { watch } from 'vue'
import { type VDialog } from 'vuetify/components'

export default defineComponent({
  name: 'BaseDialog'
})
</script>

<style lang="scss">
.base-dialog .v-overlay__content {
  width: 100% !important;
}

.dialog-card {
  .v-card-text {
    padding: 24px !important;
  }
}
.v-card-text.dense-content {
  padding: 0 !important;
}
</style>