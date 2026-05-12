<template>
  <v-text-field
    :model-value="modelValue"
    :label="label"
    :readonly="!editable"
    :placeholder="placeholder"
    :rules="rules"
    @update:model-value="emits('update:modelValue', $event)"
    @focus="!editable && selectPath()"
  >
    <template v-if="editable" #append-inner>
      <v-btn density="compact" variant="text" @click="selectPath">
        浏览
      </v-btn>
    </template>
  </v-text-field>
</template>

<script setup lang="ts">
const props = defineProps({
  /**
   * 用户ID，必填项，根据该ID获取可选路径列表
   */
  uid: {
    type: [String, Number] as PropType<IdType>,
    required: true
  },

  label: {
    type: String,
    default: '保存路径'
  },

  placeholder: {
    type: String,
    default: '请选择保存路径'
  },

  /**
   * 当前选中的路径值，必填项，组件会在该路径发生变化时触发 update:modelValue 事件
   */
  modelValue: {
    type: String,
    default: '/'
  },

  /**
   * 路径选择的验证规则，数组中的每一项可以是一个函数，接受当前路径值作为参数，返回 true 或一个错误提示字符串
   */
  rules: {
    type: Array as PropType<((value: string) => true | string)[]>,
    default: () => []
  },

  /**
   * 选择路径对话框的标题
   */
  dialogTitle: {
    type: String,
    default: '选择路径'
  },

  /**
   * 输入框是否可编辑。不可编辑时用户只能通过点击选择路径来修改值，默认为false
   */
  editable: {
    type: Boolean,
    default: false
  },

  /**
   * 组件是否为只读模式。只读模式不允许修改值，不会触发路径选择。默认为false
   */
  readonly: {
    type: Boolean,
    default: false
  },

  /**
   * 选择路径的对话框是否为只读模式。非只读模式下允许用户在选择时新建文件夹等操作。默认为false
   */
  selectReadonly: {
    type: Boolean,
    default: false
  },

  /**
   * 是否可以选择到文件，开启只能选择到指向文件的路径
   */
  selectFile: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits<{
  /** 路径选择事件 */
  (e: 'update:modelValue', value: string): void

  /** 选择路径时确认事件 */
  (e: 'itemSelected', value: FileSelectResult): void
}>()

function getPathParent(p: string) {
  if (!p || p === '/') return '/'
  const arr = p.split('/')
  arr.pop()
  const parent = arr.join('/')
  return parent || '/'
}

async function selectPath() {
  try {
    const obj = await SfcUtils.selectFile({
      title: '选择路径',
      uid: props.uid,
      // 选择文件时，modelValue是一个指向文件的路径，而path参数接收的是一个目录路径，因此需要获取modelValue的父路径作为初始路径
      path: props.selectFile ? getPathParent(props.modelValue) : props.modelValue,
      readOnly: props.selectReadonly,
      filter: props.selectFile ? () => true : undefined
    })
    emits('itemSelected', obj)
    emits('update:modelValue', props.selectFile ? StringUtils.appendPath(obj.path, obj.file[0].name) : obj.path)
  } catch (ignore) {
    return
  }
}
</script>

<script lang="ts">
import { IdType } from 'sfc-common/model/Common'
import { StringUtils } from 'sfc-common/utils'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { FileSelectResult } from 'sfc-common/utils/SfcUtils/file/fileSelector'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, readonly } from 'vue'

export default defineComponent({
  name: 'PathSelector'
})
</script>