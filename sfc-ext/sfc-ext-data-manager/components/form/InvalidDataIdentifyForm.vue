<template>
  <base-form ref="formRef" :model-value="formData" :submit-action="actions.submit">
    <LoadingMask :loading="loading" />

    <VRow>
      <VCol>
        <VAlert>
          注意：将在后台创建一个异步任务，针对 UNIQUE 模式下的失效存储进行文件类型判断和元数据提取，期间可能会有较大的服务器IO和计算压力
        </VAlert>
      </VCol>
    </VRow>

    <VDivider class="mt-4 mb-4" />
    <VRow v-if="selectedCount > 0">
      <VCol>
        <span class="text-muted text-body-2">
          已选 {{ selectedCount }} 条失效数据
        </span>
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        <VCheckbox
          v-model="formData.reIdentify"
          label="重新识别文件类型"
          hint="勾选后将无视记录的识别状态，强制重新识别并覆盖原有结果"
          persistent-hint
          color="primary"
        />
      </VCol>
    </VRow>
  </base-form>
</template>

<script setup lang="ts">
import { CommonForm, IdType, defineForm } from 'sfc-common'
import { DataManagerAPI, IdentifyParam } from '../../api'

const SfcUtils = window.SfcUtils
const formRef = ref() as Ref<CommonForm>

const props = defineProps({
  /**
   * 已选失效数据的数量，为0时表示处理全部
   */
  selectedCount: {
    type: Number,
    default: 0
  },

  /**
   * 已选失效数据的ID列表
   */
  selectedIds: {
    type: Array as PropType<IdType[]>,
    default: () => []
  }
})

interface IdentifyFormData {
  reIdentify: boolean
}

const formInst = defineForm({
  actions: {
    /**
     * 提交文件识别任务
     */
    async submit() {
      const param: IdentifyParam = { reIdentify: formData.reIdentify }
      if (props.selectedIds.length > 0) {
        param.ids = props.selectedIds
      }
      return await SfcUtils.request(DataManagerAPI.identify(param))
    }
  },
  formData: {
    reIdentify: false
  } as IdentifyFormData,
  formRef: formRef,
  validators: {},
  throwError: true
})

const { formData, actions, loadingManager } = formInst
const loading = loadingManager.getLoadingRef()

defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent, defineProps, Ref, ref, PropType } from 'vue'

export default defineComponent({
  name: 'InvalidDataIdentifyForm'
})
</script>
