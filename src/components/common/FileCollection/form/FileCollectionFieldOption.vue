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
      <empty-tip v-if="fields.length == 0" />
      <v-table v-else>
        <thead>
          <tr><th>字段名</th><th>类型</th></tr>
        </thead>
        <tbody>
          <tr v-for="(field,index) in fields" :key="index">
            <td>{{ field.name }}</td>
            <td>{{ field.type }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import EmptyTip from '../../EmptyTip.vue'
const props = defineProps({
  modelValue: {
    type: Array as PropType<CollectionInfoField[]>,
    default: () => []
  }
})
const emits = defineEmits(['update:modelValue'])
const fields: Ref<CollectionInfoField[]> = ref([])
const addField = () => {
  const inst = SfcUtils.openComponentDialog(CollectionFieldFormVue, {
    extraDialogOptions: {
      maxWidth: '720px'
    },
    title: '新建字段',
    persistent: true,
    inWrap: true,
    async onConfirm() {
      const form = inst.getComponentInstRef() as any as CommonForm
      const formData = form.getFormData() as CollectionInfoField
      const result = await form.validate()
      if (!result.valid) {
        SfcUtils.snackbar('校验错误：' + result.errors.map(e => e.errorMessages).join(';'))
        return false
      }

      if (fields.value.findIndex(e => e.name == formData.name) != -1) {
        SfcUtils.alert(`已经存在名为【${formData.name}】的字段`)
        return false
      }
      fields.value.push(formData)
      return true
    }
  })
}
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { CollectionInfoField } from '@/core/model/FileCollection'
import SfcUtils from '@/utils/SfcUtils'
import CollectionFieldFormVue from './CollectionFieldForm.vue'
import { CommonForm } from '@/utils/FormUtils'
export default defineComponent({
  name: 'FileCollectionFieldOption'
})
</script>