<template>
  <BaseForm
    ref="formRef"
    :model-value="formData"
    :submit-action="actions.submit"
    label-width="auto"
    :auto-loading="true"
  >
    <VContainer class="pa-0" fluid>
      <VRow>
        <VCol cols="12" class="pb-1">
          <VTextField
            :model-value="displayPath"
            label="解压位置"
            :rules="validators.path"
            readonly
            hide-details="auto"
          >
            <template #append-inner>
              <VBtn
                color="primary"
                density="compact"
                variant="text"
                @click="actions.selectPath"
              >
                选择目录
              </VBtn>
            </template>
          </VTextField>
        </VCol>
        <VCol cols="12" md="6" class="pt-3 pb-1">
          <VCheckbox
            v-model="formData.appendArchiveName"
            color="primary"
            hide-details
            label="自动追加压缩包名称"
          />
        </VCol>
        <VCol cols="12" md="6" class="pt-3 pb-1">
          <VSelect
            v-model="formData.encoding"
            label="文件名编码"
            :rules="validators.encoding"
            :items="['UTF8', 'GBK']"
            hide-details="auto"
          />
        </VCol>
      </VRow>

      <div class="mt-4">
        <div 
          class="text-subtitle-2 text-primary cursor-pointer d-inline-flex align-center user-select-none"
          @click="showAdvanced = !showAdvanced"
        >
          <span>高级选项</span>
          <VIcon size="small" class="ml-1">
            {{ showAdvanced ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
          </VIcon>
        </div>
        
        <VExpandTransition>
          <div v-show="showAdvanced">
            <VRow class="mt-4">
              <VCol cols="12" md="6" class="pb-1">
                <VSelect
                  v-model="formData.format"
                  label="指定解压格式"
                  :rules="validators.format"
                  :items="availableFormats"
                  hide-details="auto"
                  @update:model-value="actions.onFormatChange"
                />
              </VCol>

              <VCol cols="12" md="6" class="pb-1">
                <VSelect
                  v-model="formData.engineId"
                  label="解压引擎"
                  :rules="validators.engineId"
                  :items="availableEngines"
                  item-title="engineName"
                  item-value="engineId"
                  hide-details="auto"
                />
              </VCol>
            </VRow>
          </div>
        </VExpandTransition>
      </div>
    </VContainer>
  </BaseForm>
</template>

<script setup lang="ts">
import BaseForm from 'sfc-common/components/common/BaseForm.vue'
import { Validators } from 'sfc-common/core/helper/Validators'
import { IdType, ArchiveEngine } from 'sfc-common/model'
import { defineForm, CommonForm } from 'sfc-common/utils/FormUtils'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { StringUtils } from 'sfc-common/utils'

/**
 * 是否展示高级选项面板的控制标志
 */
const showAdvanced = ref(false)

const props = defineProps({
  /**
   * 解压到目标路径所属用户的ID
   */
  uid: {
    type: [String, Number] as PropType<IdType>,
    default: 0
  },
  /**
   * 解压目标的默认基础路径
   */
  path: {
    type: String,
    default: '/'
  },
  /**
   * 默认使用的文件名字符编码
   */
  encoding: {
    type: String,
    default: 'UTF8'
  },
  /**
   * 待解压的文件名（包含后缀的完整名称）
   */
  filename: {
    type: String,
    default: ''
  },
  /**
   * 系统加载或传入的支持的所有解压引擎列表
   */
  archiveEngineList: {
    type: Array as PropType<ArchiveEngine[]>,
    default: () => []
  }
})

/**
 * 根据支持的解压引擎列表，计算出所有可用的解压格式后缀名
 * (去重，去点，按字符长度降序排序以防 .tar.gz 优先匹配截取到 .gz)
 */
const availableFormats = computed(() => {
  const formats = new Set<string>()
  props.archiveEngineList.forEach(engine => {
    engine.decompressExtensions?.forEach(ext => {
      const cleanExt = ext.startsWith('.') ? ext.substring(1) : ext
      formats.add(cleanExt.toLowerCase())
    })
  })
  return Array.from(formats).sort((a, b) => b.length - a.length)
})

/**
 * 获取压缩包的基础名称（剔除了其所拥有的有效压缩扩展后缀）
 * @param name 压缩包的完整文件名
 * @returns 截取扩展名之后的文件基准名称
 */
function getArchiveBaseName(name: string) {
  const matchingExt = availableFormats.value.find(ext => name.toLowerCase().endsWith('.' + ext))
  if (matchingExt) {
    return name.substring(0, name.length - matchingExt.length - 1)
  }
  const idx = name.lastIndexOf('.')
  return idx > 0 ? name.substring(0, idx) : name
}

/**
 * 根据是否自动追加压缩包名称的情况，拼装最终将要解压到的目标物理路径
 * @param basePath 基础解压挂载层所在路径
 * @param appendArchiveName 标记开关是否需要把带名的同名文件夹追加创建在其后面
 * @returns 正确合并合并结构后的处理路径
 */
function getMergedPath(basePath: string, appendArchiveName: boolean) {
  if (!appendArchiveName || !props.filename) {
    return basePath
  }
  return StringUtils.appendPath(basePath, getArchiveBaseName(props.filename))
}

/**
 * 用户所选定的解压目标基础环境路径，在此仅保存手动选择的未处理策略（如自动追加同名目录策略不包括在其中）所在的父级目录
 */
const selectedPath = ref(props.path)

/**
 * 实际在界面输入框中展示最终目标合并解压路径（包含了可能的追加文件夹名）
 */
const displayPath = computed(() => getMergedPath(selectedPath.value, formData.appendArchiveName))

/**
 * 根据当前选中的解压格式，过滤返回支持该格式的所有可选解压引擎列表
 */
const availableEngines = computed(() => {
  if (!formData.format) return []
  const formatWithDot = `.${formData.format}`
  return props.archiveEngineList.filter(engine => 
    engine.decompressExtensions?.some(ext => ext.toLowerCase() === formatWithDot.toLowerCase())
  )
})

/**
 * 根表单绑定的 DOM / Vue 组合实例引用，用于调用校验逻辑等
 */
const formRef = ref() as Ref<CommonForm>

/**
 * 封装好的表单流程数据验证、流转及方法等集合的对象实例
 */
const formInst = defineForm({
  actions: {
    /**
     * 触发通用文件路径选择对话框，用于选取重新指定的解压根目标路径
     */
    async selectPath() {
      try {
        const path = await SfcUtils.selectPath({
          uid: props.uid,
          path: selectedPath.value,
          title: '选择解压位置',
          readOnly: false
        })
        selectedPath.value = path
        formData.path = getMergedPath(path, formData.appendArchiveName)
      } catch (err) {
        if (err != 'cancel') {
          throw err
        }
      }
    },
    /**
     * 选中的强制解压格式发生表单变更时被回调执行，将引擎同步重设为新格式支持引擎列里的首个
     */
    onFormatChange() {
      if (availableEngines.value.length > 0) {
        formData.engineId = availableEngines.value[0].engineId
      } else {
        formData.engineId = ''
      }
    },
    /**
     * 在数据准备通过被作为 Promise 提交前置入最后实际需要落盘组合过的字段（如拼合了文件名的路径）
     */
    async submit() {
      formData.path = displayPath.value
      return formData
    }
  },
  formData: {
    path: getMergedPath(props.path, true),
    encoding: props.encoding || 'UTF8',
    appendArchiveName: true,
    format: '',
    engineId: ''
  },
  formRef,
  validators: {
    path: [Validators.notNull('解压位置不能为空')],
    encoding: [Validators.notNull('文件名编码不能为空')],
    format: [Validators.notNull('必须选择解压格式')],
    engineId: [Validators.notNull('必须选择解压引擎')]
  }
})

const { actions, formData, validators } = formInst

/**
 * 监听是否自动追加压缩包名称标志属性切换，以此重算更新真正的存放位置
 */
watch(() => formData.appendArchiveName, (enabled) => {
  formData.path = getMergedPath(selectedPath.value, enabled)
})

/**
 * 监听并接收外部调用或上层组件通过 Props 传入的所在基础解压路径发生调整
 */
watch(() => props.path, (path) => {
  selectedPath.value = path
  formData.path = getMergedPath(path, formData.appendArchiveName)
})

/**
 * 随着被解压缩的包名称改变而对应着实时刷新新文件夹名字拼接结果
 */
watch(() => props.filename, () => {
  formData.path = getMergedPath(selectedPath.value, formData.appendArchiveName)
})

/**
 * 在组件页面挂载构建完成后尝试进行一次自动推倒匹配合适的扩展名以及对应处理的引擎
 */
onMounted(() => {
  if (availableFormats.value.length > 0) {
    const matchedExt = availableFormats.value.find(ext => props.filename.toLowerCase().endsWith('.' + ext))
    if (matchedExt) {
      formData.format = matchedExt
    } else {
      formData.format = availableFormats.value[0]
    }
    actions.onFormatChange()
  }
})

defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent, defineProps, defineExpose, ref, Ref, PropType, watch, computed, onMounted } from 'vue'

export default defineComponent({
  name: 'ArchiveExtractForm'
})
</script>