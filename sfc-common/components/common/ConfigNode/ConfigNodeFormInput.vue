<template>
  <div>
    <VCard v-if="showFormView" class="mb-4">
      <VCardText>
        <ConfigurableForm
          :nodes="formNodes"
          read-only
          use-vuetify-native-layout
        />
      </VCardText>
    </VCard>
    <v-btn v-if="!readOnly" color="primary" @click="edit">
      编辑
    </v-btn>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  node: {
    type: Object as PropType<ConfigNodeModel>,
    default: () => {return{}}
  },
  modelValue: {
    type: String,
    default: ''
  },
  /**
   * 是否为只读。只读模式下不显示编辑按钮。
   */
  readOnly: {
    type: Boolean,
    default: false
  },
  /**
   * 是否显示表单的当前值视图
   */
  showFormView: {
    type: Boolean,
    default: true
  }
})

const valObj = computed(() => {
  return reactive(StringUtils.parseJSON(props.modelValue || props.node.value + ''))
})

const formNodes = computed(() => {
  return props.node.nodes?.map(n => {
    return {
      ...n,
      value: valObj.value?.[n.name] ?? n.value,
      nodes: n.nodes?.map(subNode => {
        return {
          ...subNode,
          value: valObj.value?.[subNode.name] ?? subNode.value
        }
      })
    }
  })
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
    async onConfirm() {
      const form = (inst.getComponentInstRef() as any as CommonForm)
      const validRst = await form.validate()
      if (validRst.valid) {
        emits('update:model-value', JSON.stringify(form.getFormData()))
        return true
      } else {
        SfcUtils.snackbar(validRst.errors.map(e => e.errorMessages).join(';'))
        return false
      }
    }
  })
}

</script>

<script lang="ts">
import { ConfigNodeModel } from 'sfc-common/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed, reactive } from 'vue'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import ConfigFormVue from '../ConfigForm.vue'
import { CommonForm } from 'sfc-common/utils/FormUtils'
import { StringUtils } from 'sfc-common/utils/StringUtils'
import ConfigurableForm from './ConfigurableForm.vue'

export default defineComponent({
  name: 'ConfigNodeFormInput'
})
</script>

<style lang="scss" scoped>
.config-node-form-input {
  border: 1px solid rgba(var(--v-theme-primary), .3);
  padding: 6px;
  margin-bottom: 6px;
  margin: 12px 0;
  
  .group-title {
    margin: 12px 0;
    font-weight: 600;
  }
}
</style>