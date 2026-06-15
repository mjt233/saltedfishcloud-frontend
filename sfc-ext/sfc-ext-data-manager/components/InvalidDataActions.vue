<template>
  <div class="d-flex invalid-data-actions">
    <slot name="prepend" />
    <v-btn
      v-if="item.status !== 'COMPLETED'"
      size="small"
      :variant="variant"
      color="success"
      prepend-icon="mdi-download"
      @click.stop="emit('download')"
    >
      下载
    </v-btn>
    <v-btn
      v-if="item.status === 'PENDING' && item.type === 'INVALID_FILE_RECORD'"
      size="small"
      :variant="variant"
      color="success"
      @click.stop="emit('fix')"
    >
      修复
    </v-btn>
    <v-btn
      v-if="item.status === 'PENDING' && item.type === 'INVALID_STORAGE'"
      size="small"
      :variant="variant"
      color="primary"
      @click.stop="emit('claim')"
    >
      认领
    </v-btn>
    <v-btn
      v-if="item.status === 'PENDING' && item.type === 'INVALID_STORAGE'"
      size="small"
      :variant="variant"
      color="info"
      @click.stop="emit('publish')"
    >
      发布
    </v-btn>
    <v-btn
      v-if="item.status === 'PUBLISHED'"
      size="small"
      :variant="variant"
      color="warning"
      @click.stop="emit('unpublish')"
    >
      取消发布
    </v-btn>
    <v-btn
      v-if="item.status === 'CLAIMED'"
      size="small"
      :variant="variant"
      color="primary"
      @click.stop="emit('complete')"
    >
      完成
    </v-btn>

    <v-btn
      v-if="canDiscard()"
      size="small"
      :variant="variant"
      color="error"
      prepend-icon="mdi-delete-outline"
      @click.stop="onDiscardConfirm"
    >
      丢弃
    </v-btn>
    <slot name="append" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { PropType } from 'vue'
import type { InvalidDataRecord } from '../model'

const SfcUtils = window.SfcUtils

/** 组件属性 */
const props = defineProps({
  /** 要操作的失效数据记录 */
  item: {
    type: Object as PropType<InvalidDataRecord>,
    required: true
  },
  /** 按钮变体风格，表格行用 'text'，抽屉用 'tonal' */
  variant: {
    type: String as PropType<'text' | 'tonal' | 'outlined' | 'flat' | 'elevated' | 'plain'>,
    default: 'text'
  }
})

/** 组件事件 */
const emit = defineEmits<{
  /** 下载文件 */
  download: []
  /** 修复失效记录 */
  fix: []
  /** 认领数据 */
  claim: []
  /** 发布数据为可认领状态 */
  publish: []
  /** 取消发布 */
  unpublish: []
  /** 标记处理完成 */
  complete: []
  /** 丢弃确认后触发 */
  discard: []
}>()

/** 丢弃确认气泡是否展开（仅 popover 模式） */
const discarding = ref(false)

/** 是否可丢弃 */
const canDiscard = () => {
  if (props.item.status === 'PUBLISHED' || props.item.status === 'COMPLETED') return false
  if (props.item.status === 'CLAIMED') return false
  return true
}

/**
 * 丢弃确认处理
 * popover 模式下直接 emit；非 popover 模式下弹出 confirm 对话框后 emit
 */
const onDiscardConfirm = async() => {
  try {
    await SfcUtils.confirm('确定要丢弃该数据吗？此操作不可逆！', '操作确认', { cancelToReject: true })
    // eslint-disable-next-line vue/require-explicit-emits
    emit('discard')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped lang="scss">
.invalid-data-actions {
  min-width: 240px;
  >.v-btn {
    margin-right: 4px;
  }
}
</style>
