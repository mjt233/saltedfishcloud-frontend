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
        <span class="text-primary d-block pb-6 pt-3" :class="showChange ? 'pl-3' : ''">{{ group.title || group.name }}</span>
        <form-row>
          <template v-for="node in group.nodes" :key="node.name">
            <component
              :is="node.isRow ? 'div' : 'form-col'"
              :required="node.required"
              top-label
              :label="['switch', 'text', 'select'].includes(node.inputType) ? '' : (node.title || node.name)"
              :class="node.isRow ? 'custom-row' : 'mw-50'"
            >
              <config-node
                :read-only="readOnly"
                dense
                :style="`width: 100%; ${showChange ? '' : 'padding: 0;'}`"
                :show-describe="false"
                :show-title="false"
                :node="node"
                :show-change="showChange"
                @change="emits('change', {name: node.name, value: $event, node: node})"
              />
            </component>
          </template>
        </form-row>
      </template>
    </form-grid>
  </base-form>
</template>

<script setup lang="ts">
import BaseForm from 'sfc-common/components/common/BaseForm.vue'
import { CommonForm, defineForm } from 'sfc-common/utils/FormUtils'
const formRef = ref() as Ref<CommonForm>
const props = defineProps({
  nodes: {
    type: Array as PropType<ConfigNodeModel[]>,
    default: () => []
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  /**
   * 是否高亮显示修改项
   */
  showChange: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits<{
  (e: 'submit'): any,
  (e: 'change', value: { name:string, value: any, node: ConfigNodeModel }): any
}>()

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
import { ConfigNodeModel } from 'sfc-common/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'ConfigurableForm'
})
</script>

<style scoped>
.custom-row {
  width: 100%;
}
</style>