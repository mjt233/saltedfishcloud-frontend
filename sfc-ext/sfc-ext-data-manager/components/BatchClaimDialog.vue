<template>
  <div class="batch-claim-dialog">
    <!-- 筛选条件 -->
    <InvalidDataFilter
      :model-value="filterValue"
      :type-options="typeOptions"
      :status-options="statusOptions"
      :provider-options="providerOptions"
      :types-name-map="typesNameMap"
      allow-groovy-script
      default-expanded
      @apply="onFilterApply"
    />

    <v-divider class="my-3" />

    <!-- 目标网盘选择 -->
    <v-select
      v-model="formData.targetUid"
      :items="targetUidOptions"
      label="保存位置"
      color="primary"
      variant="underlined"
      density="compact"
      class="mb-2"
    />

    <!-- 保存目录选择 -->
    <PathSelector
      v-model="formData.savePath"
      :uid="formData.targetUid"
      label="保存目录"
      placeholder="点击选择保存路径"
      class="mb-2"
    />

    <!-- Groovy 动态脚本配置 -->
    <div class="mt-2">
      <div class="text-caption text-medium-emphasis mb-1">
        动态保存位置脚本（可选）
      </div>
      <v-textarea
        placeholder="点击编辑动态保存位置脚本..."
        :model-value="formData.script"
        auto-grow
        :rows="1"
        :max-rows="3"
        hint="脚本返回值应为 Map: [path: '保存目录', name: '文件名']。path 为空时使用上方保存目录，name 为空时使用失效数据本身的文件名"
        persistent-hint
        readonly
        :variant="'solo'"
        @update:focused="$event && openScriptEditor()"
        @click.stop="openScriptEditor"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { getContext } from 'sfc-common'
import { useInvalidDataList, statusOptions, typeOptions } from '../composables/useInvalidDataList'
import InvalidDataFilter from './InvalidDataFilter.vue'
import InvalidDataFilterGroovyEditor from './InvalidDataFilterGroovyEditor.vue'
import type { IdType } from 'sfc-common/model'
import type { InvalidDataFilterValue, BatchClaimParam } from '../model'
import { GroovyClaimExample } from '../codeExample/invalidDataScriptExample'

const SfcUtils = window.SfcUtils
const PathSelector = window.Components.PathSelector

const props = defineProps<{
/** 当前操作用户ID */
  uid: IdType
/** 额外的默认筛选条件（不包含status），可传入 type、fileType、minFileSize、maxFileSize、filterScript 等 */
  defaultFilter?: Partial<Pick<InvalidDataFilterValue, 'type' | 'fileType' | 'minFileSize' | 'maxFileSize' | 'filterScript'>>
}>()

/** 筛选组件所需的 provider 数据 */
const {
  providerOptions,
  typesNameMap,
  loadProviders
} = useInvalidDataList()

/** 当前筛选条件 */
const filterValue = reactive<InvalidDataFilterValue>({
  status: ['PENDING', 'PUBLISHED'],
  type: props.defaultFilter?.type,
  fileType: props.defaultFilter?.fileType,
  minFileSize: props.defaultFilter?.minFileSize,
  maxFileSize: props.defaultFilter?.maxFileSize,
  filterScript: props.defaultFilter?.filterScript
})

/** 目标网盘候选项 */
const targetUidOptions = computed(() => [
  {
    title: '我的网盘',
    value: getContext().session.value.user.id
  },
  {
    title: '公共网盘',
    value: '0' as IdType
  }
])

/** 表单数据 */
const formData = reactive({
  /** 目标网盘用户ID */
  targetUid: getContext().session.value.user.id as IdType,
  /** 保存目录 */
  savePath: '/',
  /** Groovy 脚本内容 */
  script: '' as string | undefined
})

/**
 * 筛选条件应用回调
 * @param value 用户选定的筛选条件
 */
const onFilterApply = (value: InvalidDataFilterValue) => {
  filterValue.status = value.status
  filterValue.type = value.type
  filterValue.fileType = value.fileType
  filterValue.minFileSize = value.minFileSize
  filterValue.maxFileSize = value.maxFileSize
  filterValue.filterScript = value.filterScript
}

/**
 * 打开 Groovy 脚本编辑器对话框
 * 对话框确认后更新 formData.script
 */
const openScriptEditor = () => {
  const dialogInst = SfcUtils.openComponentDialog(InvalidDataFilterGroovyEditor, {
    props: {
      modelValue: formData.script || '',
      codeExamples: GroovyClaimExample,
      style: { height: '60vh' },
      placeholder: `脚本返回值应为 Map: [path: '保存目录', name: '文件名']。
      path 为空时使用上方保存目录，name 为空时使用失效数据本身的文件名。
      参考案例：
      return [
        path: '/' + typeCheckResult.detail.typeName,
        name: TypeUtils.dateToString(record.lastModified, 'yyyy-MM-dd_HH-mm-ss') + typeCheckResult.detail.extension
      ]
  `
    },
    title: '编辑动态保存位置脚本',
    extraDialogOptions: {
      maxWidth: '800px',
      persistent: true
    },
    onConfirm() {
      const editor = (dialogInst.getComponentInstRef() as any)?.getEditor()
      if (editor) {
        formData.script = editor.getValue() || undefined
      }
      return true
    }
  })
}

/**
 * 收集当前配置，组装为 BatchClaimParam
 * 供外部对话框 onConfirm 回调获取参数
 * @returns 批量认领参数
 */
const getBatchClaimParam = (): BatchClaimParam => {
  // 构造筛选查询参数（文件大小从 MiB 转为字节）
  const query: BatchClaimParam['query'] = {
    type: filterValue.type,
    status: filterValue.status,
    fileType: filterValue.fileType,
    minFileSize: filterValue.minFileSize != null ? filterValue.minFileSize * 1024 * 1024 : undefined,
    maxFileSize: filterValue.maxFileSize != null ? filterValue.maxFileSize * 1024 * 1024 : undefined,
    filterScript: filterValue.filterScript
  }

  return {
    query,
    targetUid: formData.targetUid,
    savePath: formData.savePath,
    fileName: '',
    script: formData.script
  }
}

/** 初始化：加载识别器选项 */
onMounted(() => {
  loadProviders()
})

defineExpose({ getBatchClaimParam })
</script>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * 批量认领配置对话框组件。
 *
 * 整合了失效数据筛选、保存路径配置和 Groovy 动态脚本编辑，
 * 通过 `defineExpose` 暴露 `getBatchClaimParam` 方法供外部获取配置参数。
 *
 * 调用方通过 `SfcUtils.openComponentDialog` 打开此组件，
 * 在"预览结果"按钮回调中获取参数后打开预览对话框。
 */
export default defineComponent({
  name: 'BatchClaimDialog'
})
</script>

<style lang="scss" scoped>
.batch-claim-dialog {
  min-height: 300px;
}
</style>
