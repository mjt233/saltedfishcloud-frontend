<template>
  <base-form
    ref="formRef"
    :model-value="formData"
    :submit-action="actions.submit"
  >
    <form-grid
      label-width="auto"
      row-height="72px"
    >
      <template v-for="group in nodes" :key="group.name">
        <form-row style="margin-top: 24px;">
          <form-col
            v-for="node in group.nodes"
            :key="node.name"
            :required="node.required"
            top-label
            :label="node.title || node.name"
            class="mw-50"
          >
            <config-node
              dense
              style="width: 100%; padding: 0;"
              :show-change="false"
              :show-describe="false"
              :show-title="false"
              :node="node"
              @change="emits('change', {name: node.name, value: $event})"
            />
          </form-col>
        </form-row>
      </template>
    </form-grid>
  </base-form>
</template>

<script setup lang="ts">
import BaseForm from '@/components/common/BaseForm.vue'
import { CommonForm, defineForm } from '@/utils/FormUtils'
const formRef = ref() as Ref<CommonForm>
const props = defineProps({
  nodes: {
    type: Array as PropType<ConfigNodeModel[]>,
    default: () => []
  }
})
const emits = defineEmits(['submit', 'change'])

const formInst = defineForm({
  actions: {
    submit() {
    
    }
  },
  formData: {
  },
  formRef: formRef,
  validators: {},
  throwError: true
})
const { formData, actions } = formInst


defineExpose(formInst)
</script>

<script lang="ts">
import { ConfigNodeModel } from '@/core/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'ConfigurableForm'
})
</script>