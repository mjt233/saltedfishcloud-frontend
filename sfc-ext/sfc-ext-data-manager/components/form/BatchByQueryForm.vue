<template>
  <div class="batch-by-query-form">
    <base-form ref="formRef" :model-value="formData" :submit-action="actions.submit">
      <p class="text-body-2 text-medium-emphasis mb-3">
        配置筛选条件后执行{{ operationTitle }}操作。
      </p>
      <InvalidDataFilter
        :model-value="formData.filterValue"
        :status-options="statusOptions"
        :provider-options="providerOptions"
        :types-name-map="typesNameMap"
        allow-groovy-script
        @apply="onFilterApply"
      />
    </base-form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, Ref } from 'vue'
import { CommonForm, defineForm } from 'sfc-common'
import { useInvalidDataList, statusOptions } from '../../composables/useInvalidDataList'
import { DataManagerAPI } from '../../api'
import InvalidDataFilter from '../InvalidDataFilter.vue'
import type { InvalidDataFilterValue, InvalidDataQuery } from '../../model'

const SfcUtils = window.SfcUtils
const formRef = ref() as Ref<CommonForm>

/**
 * 批量丢弃/发布表单组件 props
 */
const props = defineProps({
  /**
   * 操作类型
   * - `discard`: 按条件批量丢弃
   * - `publish`: 按条件批量发布为可认领
   */
  operationType: {
    type: String as PropType<'discard' | 'publish'>,
    required: true
  }
})

/** 操作对应的中文标题 */
const operationTitle = computed(() => props.operationType === 'discard' ? '批量丢弃' : '批量发布')

/** 筛选组件所需的 provider 数据 */
const {
  providerOptions,
  typesNameMap,
  loadProviders
} = useInvalidDataList()

const formInst = defineForm({
  actions: {
    /**
     * 执行按条件批量操作
     * 根据当前筛选条件构造 InvalidDataQuery 并调用对应 API
     */
    async submit() {
      const fv = formData.filterValue
      // 构造请求参数，文件大小从 MiB 转为字节
      const query: InvalidDataQuery = {
        status: fv.status,
        fileType: fv.fileType,
        minFileSize: fv.minFileSize != null ? Math.floor(fv.minFileSize * 1024 * 1024) : undefined,
        maxFileSize: fv.maxFileSize != null ? Math.floor(fv.maxFileSize * 1024 * 1024) : undefined,
        filterScript: fv.filterScript
      }
      if (props.operationType === 'discard') {
        return await SfcUtils.request(DataManagerAPI.discardByQuery(query))
      } else {
        return await SfcUtils.request(DataManagerAPI.publishByQuery(query))
      }
    }
  },
  formData: {
    /** 当前筛选条件 */
    filterValue: {} as InvalidDataFilterValue
  },
  formRef,
  validators: {},
  throwError: true
})

const { formData, actions } = formInst

/**
 * 筛选条件应用回调
 * 由 InvalidDataFilter 在用户点击"应用"或移除筛选芯片时触发
 * @param value 用户选定的筛选条件
 */
const onFilterApply = (value: InvalidDataFilterValue) => {
  formData.filterValue.status = value.status
  formData.filterValue.fileType = value.fileType
  formData.filterValue.minFileSize = value.minFileSize
  formData.filterValue.maxFileSize = value.maxFileSize
  formData.filterValue.filterScript = value.filterScript
}

/** 初始化：加载识别器选项 */
onMounted(() => {
  loadProviders()
})

defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * 按条件批量丢弃/发布表单组件。
 *
 * 整合了 `InvalidDataFilter` 筛选条件面板，
 * 根据 `operationType` 属性决定调用的后端 API，
 * 通过 `defineExpose` 暴露完整的表单实例供外部 `SfcUtils.openComponentDialog` 调用。
 */
export default defineComponent({
  name: 'BatchByQueryForm'
})
</script>

<style lang="scss" scoped>
.batch-by-query-form {
  min-height: 200px;
}
</style>
