<template>
  <div>
    <form-grid class="config-form-view" label-width="auto">
      <template v-for="item in node.nodes" :key="item.name">
        <div class="group-title">
          {{ item.title }}
        </div>
        <form-row>
          <form-col
            v-for="field in item.nodes"
            :key="field.name"
            style="max-width: 280px;"
            :label="field.title"
          >
            {{ field.mask ? '******': valObj[field.name] }}
          </form-col>
        </form-row>
      </template>
    </form-grid>
    <v-btn color="primary" @click="edit">
      编辑
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { FormGrid,FormRow, FormCol } from '@/components'
const props = defineProps({
  node: {
    type: Object as PropType<ConfigNodeModel>,
    default: () => {return{}}
  },
  modelValue: {
    type: String,
    default: ''
  }
})
const valObj = computed(() => {
  return JSON.parse(props.modelValue || props.node.value + '')
})

const emits = defineEmits(['update:model-value'])

const edit = () => {
  const inst = SfcUtils.openComponentDialog(ConfigFormVue, {
    props: {
      groups: props.node.nodes,
      modelValue: valObj.value
    },
    title: props.node.title,
    inWrap: false,
    fullscreen: 'auto',
    onConfirm() {
      const form = (inst.getComponentInstRef() as any as CommonForm)
      emits('update:model-value', JSON.stringify(form.getFormData()))
      return true
    }
  })
}

</script>

<script lang="ts">
import { ConfigNodeModel } from '@/core/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed, reactive } from 'vue'
import SfcUtils from '@/utils/SfcUtils'
import ConfigFormVue from '../ConfigForm.vue'
import { CommonForm } from '@/utils/FormUtils'

export default defineComponent({
  name: 'ConfigNodeFormInput'
})
</script>

<style lang="scss" scoped>
.config-form-view {
  border: 1px solid rgba(var(--v-theme-primary), .3);
  padding: 6px;
  margin-bottom: 6px;
  margin: 12px 0;
}
.group-title {
  margin: 12px 0;
  font-weight: 600;
}
</style>