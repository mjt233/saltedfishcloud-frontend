<template>
  <VBtn style="text-transform: none; " :color="color" @click="openEdit">
    编辑Markdown
  </VBtn>
</template>

<script setup lang="ts">
const props = defineProps({
  readOnly: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: 'primary'
  },
  modelValue: {
    type: String,
    default: ''
  }
})
const editing = ref('')
const saveVal = ref('')
const emits = defineEmits(['update:modelValue'])
const openEdit = () => {
  SfcUtils.openComponentDialog(MarkdownEditor, {
    props: {
      modelValue: saveVal.value,
      style: {
        height: '100%'
      },
      'onUpdate:modelValue'(e: string) {
        editing.value = e
      },
      readOnly: props.readOnly
    },
    fullscreen: true,
    persistent: true,
    showConfirm: !props.readOnly,
    onConfirm() {
      saveVal.value = editing.value
      emits('update:modelValue', editing.value)
      return true
    }
  })
}
onMounted(() => {
  editing.value = saveVal.value = props.modelValue
})
</script>

<script lang="ts">
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'
import MarkdownEditor from './MarkdownEditor.vue'

export default defineComponent({
  name: 'MarkdownInput'
})
</script>