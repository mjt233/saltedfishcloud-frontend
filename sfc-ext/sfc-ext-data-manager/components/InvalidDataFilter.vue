<template>
  <div class="invalid-data-filter">
    <!-- 筛选芯片栏：展示当前活跃的筛选条件，桌面端与移动端共用 -->
    <div class="d-flex align-center flex-wrap ga-2">
      <v-chip
        v-for="chip in activeFilterChips"
        :key="chip.key"
        closable
        size="small"
        variant="tonal"
        @click:close="removeChipFilter(chip)"
      >
        {{ chip.label }}
      </v-chip>

      <v-spacer v-if="!isMobile" />

      <!-- 筛选触发按钮 -->
      <v-btn
        :color="activeFilterCount > 0 ? 'primary' : undefined"
        :variant="activeFilterCount > 0 ? 'tonal' : 'text'"
        size="small"
        class="ml-auto"
        @click="togglePanel"
      >
        <v-badge
          v-if="activeFilterCount > 0"
          :content="activeFilterCount"
          color="primary"
          inline
        >
          <v-icon start>
            mdi-filter-variant
          </v-icon>
        </v-badge>
        <v-icon v-else start>
          mdi-filter-variant
        </v-icon>
        <span>筛选</span>
      </v-btn>
    </div>

    <!-- ========== 桌面端：可折叠筛选面板 ========== -->
    <v-expand-transition v-if="!isMobile">
      <v-card v-show="panelExpanded" class="mt-2">
        <v-card-text>
          <v-row>
            <template v-for="field in filterFields" :key="field.key">
              <v-col
                v-if="field.type === 'select'"
                cols="12"
                sm="6"
                lg="3"
              >
                <v-select
                  :model-value="getDraftValue(field.key)"
                  :items="field.options"
                  :label="field.label"
                  clearable
                  hide-details
                  multiple
                  chips
                  @update:model-value="(v: any) => setDraftValue(field.key, v)"
                />
              </v-col>
              <v-col
                v-else-if="field.type === 'number'"
                cols="12"
                sm="6"
                lg="3"
              >
                <v-text-field
                  :model-value="getDraftValue(field.key)"
                  :label="field.label"
                  type="number"
                  clearable
                  hide-details
                  :min="field.min"
                  :suffix="field.suffix"
                  @update:model-value="(v: any) => setDraftValue(field.key, v != null && v !== '' ? Number(v) : undefined)"
                />
              </v-col>
            </template>
          </v-row>
          <div class="d-flex justify-end ga-2 mt-4">
            <v-btn size="small" @click="handleReset">
              重置
            </v-btn>
            <v-btn color="primary" size="small" @click="handleApply">
              应用
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-expand-transition>

    <!-- ========== 移动端：底部弹出面板 ========== -->
    <v-bottom-sheet v-if="isMobile" v-model="bottomSheetVisible" inset>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon start class="mr-2">
            mdi-filter-variant
          </v-icon>
          筛选条件
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="bottomSheetVisible = false"
          />
        </v-card-title>
        <v-divider />
        <v-card-text class="mt-2">
          <template v-for="field in filterFields" :key="field.key">
            <div v-if="field.type === 'select'" class="mb-4">
              <v-select
                :model-value="getDraftValue(field.key)"
                :items="field.options"
                :label="field.label"
                clearable
                hide-details
                multiple
                chips
                @update:model-value="(v: any) => setDraftValue(field.key, v)"
              />
            </div>
            <div v-else-if="field.type === 'number'" class="mb-4">
              <v-text-field
                :model-value="getDraftValue(field.key)"
                :label="field.label"
                type="number"
                clearable
                hide-details
                :min="field.min"
                :suffix="field.suffix"
                @update:model-value="(v: any) => setDraftValue(field.key, v != null && v !== '' ? Number(v) : undefined)"
              />
            </div>
          </template>
        </v-card-text>
        <v-divider />
        <div class="pa-4 ga-3">
          <v-btn
            variant="text"
            color="primary"
            block
            @click="handleApply"
          >
            应用
          </v-btn>
          <v-divider class="mt-2 mb-2" />
          <v-btn variant="text" block @click="handleReset">
            重置
          </v-btn>
        </div>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useCheckIsMobile } from 'sfc-common'
import type { InvalidDataFilterValue } from '../model'

/** 是否为移动端窄屏 */
const isMobile = useCheckIsMobile()

/** ==================== Props & Emits ==================== */

/**
 * 当前已应用的筛选值（由父组件通过 v-model 传入）
 * 组件内部不直接修改此值，而是通过 `apply` 事件通知父组件应用新值
 */
const props = defineProps<{
  /** 当前已应用的筛选值 */
  modelValue: InvalidDataFilterValue
  /** 状态选项列表 */
  statusOptions: { title: string, value: string }[]
  /** 文件类型识别器选项列表 */
  providerOptions: { title: string, value: string }[]
  /** 文件类型值到名称的映射表 */
  typesNameMap: Record<string, string>
}>()

/** 组件事件 */
const emit = defineEmits<{
  /** 用户点击"应用"或移除筛选芯片时触发，父组件应据此刷新列表 */
  apply: [value: InvalidDataFilterValue]
}>()

/** ==================== 内部状态 ==================== */

/**
 * 筛选条件编辑草稿
 * 用户在面板/bottom sheet 中编辑的值先写入 draft，
 * 点击"应用"后才通过 emit 通知父组件
 */
const draft = reactive<InvalidDataFilterValue>({
  status: props.modelValue.status ? [...props.modelValue.status] : undefined,
  fileType: props.modelValue.fileType ? [...props.modelValue.fileType] : undefined,
  minFileSize: props.modelValue.minFileSize,
  maxFileSize: props.modelValue.maxFileSize
})

/** 桌面端筛选面板是否展开 */
const panelExpanded = ref(false)

/** 移动端底部弹出面板是否可见 */
const bottomSheetVisible = ref(false)

/** 用户是否正在编辑筛选条件（面板打开中），用于阻止外部 modelValue 变化覆盖 draft */
const isEditing = computed(() =>
  (isMobile.value && bottomSheetVisible.value) || (!isMobile.value && panelExpanded.value)
)

/**
 * 当外部 modelValue 变化且用户未在编辑时，同步到 draft
 * 用于外部重置筛选条件（如从其他组件清空筛选）的场景
 */
watch(
  () => props.modelValue,
  (newVal) => {
    if (!isEditing.value) {
      // 深拷贝以避免引用污染
      draft.status = newVal.status ? [...newVal.status] : undefined
      draft.fileType = newVal.fileType ? [...newVal.fileType] : undefined
      draft.minFileSize = newVal.minFileSize
      draft.maxFileSize = newVal.maxFileSize
    }
  },
  { deep: true }
)

/** ==================== 筛选字段定义 ==================== */

/** 单个筛选字段的定义 */
interface FilterFieldDef {
  /** 字段键名，对应 InvalidDataFilterValue 的属性 */
  key: 'status' | 'fileType' | 'minFileSize' | 'maxFileSize'
  /** 字段标签 */
  label: string
  /** 字段类型：select 为多选下拉，number 为数字输入 */
  type: 'select' | 'number'
  /** 下拉选项（仅 select 类型有效） */
  options?: { title: string, value: string }[]
  /** 数字输入的后缀标签 */
  suffix?: string
  /** 数字输入的最小值 */
  min?: number
}

/**
 * 筛选字段配置数组
 * 同一份配置同时驱动桌面面板和移动端 bottom sheet 的字段渲染，
 * 新增筛选字段时只需在此数组中添加即可
 */
const filterFields = computed<FilterFieldDef[]>(() => [
  {
    key: 'status',
    label: '状态',
    type: 'select',
    options: props.statusOptions
  },
  {
    key: 'fileType',
    label: '文件类型',
    type: 'select',
    options: props.providerOptions
  },
  {
    key: 'minFileSize',
    label: '最小文件大小',
    type: 'number',
    suffix: 'MiB',
    min: 0
  },
  {
    key: 'maxFileSize',
    label: '最大文件大小',
    type: 'number',
    suffix: 'MiB',
    min: 0
  }
])

/** ==================== 辅助方法 ==================== */

/**
 * 从 draft 中获取指定字段的值
 * @param key 字段键名
 * @returns 字段当前值
 */
const getDraftValue = (key: string): any => {
  return (draft as any)[key]
}

/**
 * 设置 draft 中指定字段的值
 * @param key 字段键名
 * @param value 新值
 */
const setDraftValue = (key: string, value: any): void => {
  (draft as any)[key] = value
}

/** ==================== 活跃筛选芯片 ==================== */

/** 单个活跃筛选芯片的数据结构 */
interface ActiveChip {
  /** 唯一标识，用于 v-for key */
  key: string
  /** 芯片显示文本 */
  label: string
  /** 对应的筛选字段键名 */
  filterKey: keyof InvalidDataFilterValue
  /** 需要移除的具体选项值（仅数组类型字段有效），为空则表示清除整个字段 */
  value?: string
}

/**
 * 从当前已应用的 modelValue 计算活跃筛选芯片列表
 * 芯片基于已应用的筛选值（而非 draft），确保芯片与实际查询条件一致
 * @returns 活跃筛选芯片数组
 */
const activeFilterChips = computed<ActiveChip[]>(() => {
  const chips: ActiveChip[] = []
  const val = props.modelValue

  // 状态筛选芯片（每个选中状态一个芯片）
  if (val.status && val.status.length > 0) {
    for (const s of val.status) {
      const option = props.statusOptions.find(o => o.value === s)
      chips.push({
        key: `status-${s}`,
        label: `状态: ${option?.title ?? s}`,
        filterKey: 'status',
        value: s
      })
    }
  }

  // 文件类型筛选芯片（每个选中类型一个芯片）
  if (val.fileType && val.fileType.length > 0) {
    for (const ft of val.fileType) {
      chips.push({
        key: `fileType-${ft}`,
        label: `类型: ${props.typesNameMap[ft] ?? ft}`,
        filterKey: 'fileType',
        value: ft
      })
    }
  }

  // 文件大小下限芯片
  if (val.minFileSize != null) {
    chips.push({
      key: 'minFileSize',
      label: `≥ ${val.minFileSize} MiB`,
      filterKey: 'minFileSize'
    })
  }

  // 文件大小上限芯片
  if (val.maxFileSize != null) {
    chips.push({
      key: 'maxFileSize',
      label: `≤ ${val.maxFileSize} MiB`,
      filterKey: 'maxFileSize'
    })
  }

  return chips
})

/** 活跃筛选条件总数 */
const activeFilterCount = computed(() => activeFilterChips.value.length)

/** ==================== 操作方法 ==================== */

/**
 * 切换筛选面板/bottom sheet 的可见性
 * 桌面端切换展开面板，移动端切换底部弹出面板
 */
const togglePanel = () => {
  if (isMobile.value) {
    bottomSheetVisible.value = !bottomSheetVisible.value
    // 打开 bottom sheet 时同步 draft 为当前 modelValue
    if (bottomSheetVisible.value) {
      syncDraftFromModel()
    }
  } else {
    panelExpanded.value = !panelExpanded.value
    // 展开面板时同步 draft 为当前 modelValue
    if (panelExpanded.value) {
      syncDraftFromModel()
    }
  }
}

/**
 * 将当前已应用的 modelValue 同步到编辑草稿 draft
 * 在打开筛选面板时调用，确保编辑起点与实际查询一致
 */
const syncDraftFromModel = () => {
  const val = props.modelValue
  draft.status = val.status ? [...val.status] : undefined
  draft.fileType = val.fileType ? [...val.fileType] : undefined
  draft.minFileSize = val.minFileSize
  draft.maxFileSize = val.maxFileSize
}

/**
 * 应用当前 draft 中的筛选条件
 * 将 draft 值深拷贝后通过 apply 事件发送给父组件，
 * 同时更新 modelValue、关闭面板/bottom sheet
 */
const handleApply = () => {
  const appliedValue: InvalidDataFilterValue = {
    status: draft.status ? [...draft.status] : undefined,
    fileType: draft.fileType ? [...draft.fileType] : undefined,
    minFileSize: draft.minFileSize,
    maxFileSize: draft.maxFileSize
  }

  // 清理空数组为 undefined，避免传递空数组给后端
  if (appliedValue.status && appliedValue.status.length === 0) {
    appliedValue.status = undefined
  }
  if (appliedValue.fileType && appliedValue.fileType.length === 0) {
    appliedValue.fileType = undefined
  }

  emit('apply', appliedValue)

  // 关闭面板
  panelExpanded.value = false
  bottomSheetVisible.value = false
}

/**
 * 重置所有筛选条件为默认值
 * 清空 draft 并立即应用
 */
const handleReset = () => {
  draft.status = undefined
  draft.fileType = undefined
  draft.minFileSize = undefined
  draft.maxFileSize = undefined

  const resetValue: InvalidDataFilterValue = {}
  emit('apply', resetValue)

  // 关闭面板
  panelExpanded.value = false
  bottomSheetVisible.value = false
}

/**
 * 从已应用的筛选条件中移除指定的芯片
 * 点击芯片关闭按钮时调用，直接基于 modelValue 修改后应用
 * @param chip 要移除的筛选芯片
 */
const removeChipFilter = (chip: ActiveChip) => {
  // 先同步 draft 到当前 modelValue
  syncDraftFromModel()

  if (chip.value !== undefined) {
    // 数组类型字段：移除特定值
    const arr = draft[chip.filterKey] as string[] | undefined
    if (arr) {
      const idx = arr.indexOf(chip.value)
      if (idx >= 0) {
        arr.splice(idx, 1)
      }
    }
  } else {
    // 标量类型字段：直接清除
    setDraftValue(chip.filterKey, undefined)
  }

  // 移除芯片后立即应用
  handleApply()
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'InvalidDataFilter'
})
</script>
