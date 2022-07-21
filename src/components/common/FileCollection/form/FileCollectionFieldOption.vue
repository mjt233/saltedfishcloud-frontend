<template>
  <v-row>
    <v-col>
      <v-btn color="primary" @click="addField">
        <v-icon icon="mdi-plus" />新建字段
      </v-btn>
    </v-col>
  </v-row>
  <v-row>
    <v-col>
      <h1>我是列表</h1>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Array as PropType<CollectionInfoField[]>,
    default: () => []
  }
})
const emits = defineEmits(['update:modelValue'])
const addField = () => {
  SfcUtils.openComponentDialog(CollectionFieldFormVue, {
    extraDialogOptions: {
      maxWidth: '720px'
    },
    title: '新建字段'
  })
}
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { CollectionInfoField } from '@/core/model/FileCollection'
import SfcUtils from '@/utils/SfcUtils'
import CollectionFieldFormVue from './CollectionFieldForm.vue'
export default defineComponent({
  name: 'FileCollectionFieldOption'
})
</script>