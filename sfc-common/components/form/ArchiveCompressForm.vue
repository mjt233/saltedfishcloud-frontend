<template>
  <BaseForm
    ref="formRef"
    :model-value="formData"
    :submit-action="actions.submit"
    label-width="auto"
    :auto-loading="true"
  >
    <VContainer class="pa-0" fluid>
      <div class="text-subtitle-1 text-primary font-weight-bold d-flex align-center mb-3">
        <VIcon start size="small">
          mdi-information-outline
        </VIcon>
        <span>基础信息</span>
      </div>
      
      <div class="mb-12">
        <VRow>
          <VCol cols="12" class="pb-1">
            <VTextField
              :model-value="formData.path"
              label="保存位置"
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
          
          <VCol cols="12" md="8" class="pt-3">
            <VTextField
              v-model="formData.name"
              label="压缩包名称"
              :rules="validators.name"
              :suffix="'.' + formData.format"
              hide-details="auto"
            />
          </VCol>

          <VCol cols="12" md="4" class="pt-3">
            <VSelect
              v-model="formData.format"
              label="压缩格式"
              :rules="validators.format"
              :items="availableFormats"
              hide-details="auto"
              @update:model-value="actions.onFormatChange"
            />
          </VCol>
        </VRow>
      </div>

      <div class="text-subtitle-1 text-primary font-weight-bold d-flex align-center mb-3">
        <VIcon start size="small">
          mdi-engine-outline
        </VIcon>
        <span>引擎与参数设置</span>
      </div>

      <VRow>
        <VCol cols="12" class="pb-1">
          <VSelect
            v-model="formData.engineId"
            label="压缩引擎"
            :rules="validators.engineId"
            :items="availableEngines"
            item-title="engineName"
            item-value="engineId"
            hide-details="auto"
          />
        </VCol>

        <VCol cols="12" md="6" class="pt-3">
          <VSelect
            v-model="formData.encoding"
            label="文件名编码"
            :rules="validators.encoding"
            :items="['UTF8', 'GBK']"
            hide-details="auto"
          />
        </VCol>

        <VCol cols="12" md="6" class="pt-3">
          <VSelect
            v-model="formData.compressionLevel"
            label="压缩级别"
            :rules="validators.compressionLevel"
            :items="compressionLevelItems"
            hide-details="auto"
          />
        </VCol>
      </VRow>
    </VContainer>
  </BaseForm>
</template>

<script setup lang="ts">
import BaseForm from 'sfc-common/components/common/BaseForm.vue'
import { Validators } from 'sfc-common/core/helper/Validators'
import { IdType, ArchiveEngine } from 'sfc-common/model'
import { defineForm, CommonForm } from 'sfc-common/utils/FormUtils'
import SfcUtils from 'sfc-common/utils/SfcUtils'

const props = defineProps({
  archiveEngineList: {
    type: Array as PropType<ArchiveEngine[]>,
    default: () => []
  },
  path: {
    type: String,
    default: '/'
  },
  sourceUid: {
    type: [String, Number] as PropType<IdType>,
    default: 0
  },
  sourcePath: {
    type: String,
    default: '/'
  },
  sourceNames: {
    type: Array as PropType<string[]>,
    default: () => []
  }
})

function getDefaultName() {
  if (props.sourceNames.length === 1) {
    const name = props.sourceNames[0]
    const idx = name.lastIndexOf('.')
    return idx > 0 ? name.substring(0, idx) : name
  }
  if (props.sourceNames.length > 1) {
    const name = props.sourcePath.split('/').pop() || 'archive'
    return name
  }
  return 'archive'
}

const formRef = ref() as Ref<CommonForm>
const formInst = defineForm({
  actions: {
    async selectPath() {
      try {
        const selectedPath = await SfcUtils.selectPath({
          uid: props.sourceUid,
          path: formData.path,
          title: '选择保存位置',
          readOnly: false
        })
        formData.path = selectedPath
      } catch (err) {
        if (err !== 'cancel') {
          throw err
        }
      }
    },
    onFormatChange() {
      if (availableEngines.value.length > 0) {
        formData.engineId = availableEngines.value[0].engineId
      } else {
        formData.engineId = ''
      }
    },
    async submit() {
      return formData
    }
  },
  formData: {
    path: props.path,
    name: getDefaultName(),
    format: '',
    engineId: '',
    encoding: 'UTF8',
    compressionLevel: 'NORMAL'
  },
  formRef,
  validators: {
    path: [Validators.notNull('保存位置不能为空')],
    name: [Validators.notNull('压缩包名称不能为空')],
    format: [Validators.notNull('必须选择压缩格式')],
    engineId: [Validators.notNull('必须选择压缩引擎')],
    encoding: [Validators.notNull('必须选择编码')],
    compressionLevel: [Validators.notNull('必须选择压缩级别')]
  }
})

const { actions, formData, validators } = formInst

const compressionLevelItems = [
  { title: '仅存储 (STORE)', value: 'STORE' },
  { title: '最快 (FASTEST)', value: 'FASTEST' },
  { title: '较快 (FAST)', value: 'FAST' },
  { title: '标准 (NORMAL)', value: 'NORMAL' },
  { title: '较好 (HIGH)', value: 'HIGH' },
  { title: '最好 (ULTRA)', value: 'ULTRA' }
]

const availableFormats = computed(() => {
  const formats = new Set<string>()
  props.archiveEngineList.forEach(engine => {
    engine.compressExtensions?.forEach(ext => {
      const cleanExt = ext.startsWith('.') ? ext.substring(1) : ext
      formats.add(cleanExt.toLowerCase())
    })
  })
  return Array.from(formats)
})

const availableEngines = computed(() => {
  if (!formData.format) return []
  const formatWithDot = `.${formData.format}`
  return props.archiveEngineList.filter(engine => 
    engine.compressExtensions?.some(ext => ext.toLowerCase() === formatWithDot.toLowerCase())
  )
})

onMounted(() => {
  if (availableFormats.value.length > 0) {
    formData.format = availableFormats.value[0]
    actions.onFormatChange()
  }
})

defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent, defineProps, defineExpose, ref, Ref, PropType, computed, onMounted } from 'vue'

export default defineComponent({
  name: 'ArchiveCompressForm'
})
</script>
