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
          <tr>
            <th>字段名</th>
            <th>默认值</th>
            <th style="width: 96px">
              类型
            </th>
            <th style="width: 81px">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(field,index) in fields" :key="index">
            <td>{{ field.name }}</td>
            <td>{{ field.value }}</td>
            <td>{{ field.type == 'OPTION' ? '下拉选择' : '文本输入' }}</td>
            <td>
              <div class="d-flex align-center justify-space-between">
                <v-icon style="cursor:pointer" icon="mdi-pencil" @click="editField(index)" />
                <v-icon style="cursor:pointer" icon="mdi-delete" @click="deleteField(index)" />
              </div>
            </td>
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

watch(fields.value, () => {
  emits('update:modelValue', fields.value)
})
watch(props.modelValue, () => {
  fields.value = props.modelValue
  console.log('change了')
})

const deleteField = async(index: number) => {
  await SfcUtils.confirm('确定要删除这个字段吗？', '删除确认')
  fields.value.splice(index, 1)
}
const editField = async(index: number) => {
  const formProps = {
    initValue: fields.value[index]
  }
  const inst = SfcUtils.openComponentDialog(CollectionFieldFormVue, {
    extraDialogOptions: {
      maxWidth: '720px'
    },
    props: formProps,
    title: '编辑字段',
    persistent: true,
    inWrap: true,
    async onConfirm() {
      const form = inst.getComponentInstRef() as any as CommonForm
      const formData = form.getFormData() as CollectionInfoField
      if(!(await validateFieldForm(form))) {
        return false
      }

      const existIdx = fields.value.findIndex(e => e.name == formData.name)
      if (existIdx != -1 && existIdx != index) {
        SfcUtils.alert(`已经存在名为【${formData.name}】的字段`)
        return false
      }
      Object.assign(fields.value[index], formData)
      return true
    }
  })
}
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
      if(!(await validateFieldForm(form))) {
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

const validateFieldForm = async(form: CommonForm) => {
  const result = await form.validate()
  if (!result.valid) {
    SfcUtils.snackbar('校验错误：' + result.errors.map(e => e.errorMessages).join(';'))
    return false
  } else {
    const formData = form.getFormData() as CollectionInfoField
    if (formData.type == 'OPTION' && formData.value && formData.options.findIndex(e => e == formData.value) == -1) {
      SfcUtils.alert('默认值不在候选值范围内')
      return false
    }
    return true
  }
}
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, watch } from 'vue'
import { CollectionInfoField } from '@/core/model/FileCollection'
import SfcUtils from '@/utils/SfcUtils'
import CollectionFieldFormVue from './CollectionFieldForm.vue'
import { CommonForm } from '@/utils/FormUtils'
export default defineComponent({
  name: 'FileCollectionFieldOption'
})
</script>