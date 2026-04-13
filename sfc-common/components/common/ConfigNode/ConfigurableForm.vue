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
        <!-- 行 row -->
        <component :is="layoutRow" gap="18">
          <template v-for="node in group.nodes" :key="node.name">
            <!-- 列 col -->
            <component
              :is="node.isRow ? 'div' : layoutCol"
              cols="12"
              :required="node.required"
              top-label
              :label="['switch', 'text', 'select'].includes(node.inputType) ? '' : (node.title || node.name)"
              :class="node.isRow ? 'custom-row' : useVuetifyNativeLayout ? '' : 'mw-50'"
            >
              <config-node
                :read-only="readOnly"
                dense
                :style="`width: 100%; ${showChange ? '' : 'padding: 0;'}`"
                :show-describe="false"
                :show-title="false"
                :node="node"
                :show-change="showChange"
                :use-vuetify-native-layout="useVuetifyNativeLayout"
                @change="emits('change', {name: node.name, value: $event, node: node})"
              />
            </component>
          </template>
        </component>
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
  },
  /**
   * 使用Vuetify原生的栅格布局组件
   */
  useVuetifyNativeLayout: {
    type: Boolean,
    default: false
  }
})

const layoutRow = computed(() => {
  return props.useVuetifyNativeLayout ? 'v-row' : 'form-row'
})
const layoutCol = computed(() => {
  return props.useVuetifyNativeLayout ? 'v-col' : 'form-col'
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
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed } from 'vue'

export default defineComponent({
  name: 'ConfigurableForm'
})
</script>

<style scoped>
.custom-row {
  width: 100%;
}
</style>