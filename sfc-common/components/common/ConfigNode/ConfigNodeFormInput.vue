<template>
  <div>
    <VCard v-if="showFormView" class="mb-4">
      <VCardText>
        <ConfigurableForm
          :nodes="formNodes"
          :read-only="readOnly || !inlineEdit"
          use-vuetify-native-layout
          @change="handleInlineChange"
        />
      </VCardText>
    </VCard>
    <v-btn v-if="!readOnly && !inlineEdit" color="primary" @click="edit">
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
  /**
   * 整个表单的各项值，JSON字符串格式。优先级高于node.value。
   * 
   * key为node.nodes中定义的节点的name，value为对应节点的值。
   */
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
   * 非内联编辑模式下，是否显示表单的当前值视图
   */
  showFormView: {
    type: Boolean,
    default: true
  },
  /**
   * 是否启用内联编辑模式。
   * 启用后，非只读状态下可直接与 VCard 内的表单交互进行编辑，无需点击编辑按钮。
   * 启用时编辑按钮将被隐藏。
   */
  inlineEdit: {
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

/**
 * 内联编辑模式下处理表单字段变更，将最新值合并后直接 emit 给父组件。
 * @param e - ConfigurableForm 的 change 事件载荷
 */
const handleInlineChange = (e: { name: string, value: any, node: ConfigNodeModel }) => {
  if (!props.inlineEdit || props.readOnly) return
  // 合并最新字段值并通知父组件
  const newData = { ...valObj.value, [e.name]: e.value }
  emits('update:model-value', JSON.stringify(newData))
}

const edit = () => {
  // 初始化本地数据副本，以当前值为起点，后续通过 change 事件收集用户修改
  const localData = reactive({ ...valObj.value })

  const inst = SfcUtils.openComponentDialog(ConfigurableForm, {
    props: {
      nodes: formNodes.value,
      useVuetifyNativeLayout: true,
      // 监听子节点变更，实时更新本地数据副本
      onChange(e: { name: string, value: any, node: ConfigNodeModel }) {
        localData[e.name] = e.value
      }
    },
    title: props.node.title,
    inWrap: false,
    fullscreen: 'auto',
    async onConfirm() {
      const form = inst.getInstAsForm()
      const validRst = await form.validate()
      if (validRst.valid) {
        emits('update:model-value', JSON.stringify(localData))
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
import { StringUtils } from 'sfc-common/utils/StringUtils'
import ConfigurableForm from './ConfigurableForm.vue'
import { use } from 'echarts'

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