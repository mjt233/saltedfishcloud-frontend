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
        <VCol cols="12">
          <VTextField
            :model-value="displayPath"
            label="解压位置"
            :rules="validators.path"
            readonly
          >
            <template #append-inner>
              <VBtn
                color="primary"
                density="comfortable"
                variant="text"
                @click="actions.selectPath"
              >
                选择目录
              </VBtn>
            </template>
          </VTextField>
        </VCol>
        <VCol cols="12" class="pt-0">
          <VCheckbox
            v-model="formData.appendArchiveName"
            color="primary"
            hide-details
            label="自动追加压缩包名称"
          />
        </VCol>
        <VCol cols="12">
          <VSelect
            v-model="formData.encoding"
            label="文件名编码"
            :rules="validators.encoding"
            :items="['UTF8', 'GBK']"
          />
        </VCol>
      </VRow>
    </VContainer>
  </BaseForm>
</template>

<script setup lang="ts">
import BaseForm from 'sfc-common/components/common/BaseForm.vue'
import { Validators } from 'sfc-common/core/helper/Validators'
import { IdType } from 'sfc-common/model'
import { defineForm, CommonForm } from 'sfc-common/utils/FormUtils'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { StringUtils } from 'sfc-common/utils'

const props = defineProps({
  uid: {
    type: [String, Number] as PropType<IdType>,
    default: 0
  },
  path: {
    type: String,
    default: '/'
  },
  encoding: {
    type: String,
    default: 'UTF8'
  },
  archiveName: {
    type: String,
    default: ''
  }
})

function getArchiveBaseName(name: string) {
  const idx = name.lastIndexOf('.')
  return idx > 0 ? name.substring(0, idx) : name
}

function getMergedPath(basePath: string, appendArchiveName: boolean) {
  if (!appendArchiveName || !props.archiveName) {
    return basePath
  }
  return StringUtils.appendPath(basePath, getArchiveBaseName(props.archiveName))
}

const selectedPath = ref(props.path)
const displayPath = computed(() => getMergedPath(selectedPath.value, formData.appendArchiveName))

const formRef = ref() as Ref<CommonForm>
const formInst = defineForm({
  actions: {
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
    async submit() {
      formData.path = displayPath.value
      return formData
    }
  },
  formData: {
    path: getMergedPath(props.path, false),
    encoding: props.encoding || 'UTF8',
    appendArchiveName: true
  },
  formRef,
  validators: {
    path: [Validators.notNull('解压位置不能为空')],
    encoding: [Validators.notNull('文件名编码不能为空')]
  }
})

const { actions, formData, validators } = formInst

watch(() => formData.appendArchiveName, (enabled) => {
  formData.path = getMergedPath(selectedPath.value, enabled)
})

watch(() => props.path, (path) => {
  selectedPath.value = path
  formData.path = getMergedPath(path, formData.appendArchiveName)
})

watch(() => props.archiveName, () => {
  formData.path = getMergedPath(selectedPath.value, formData.appendArchiveName)
})

defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent, defineProps, defineExpose, ref, Ref, PropType, watch, computed } from 'vue'

export default defineComponent({
  name: 'ArchiveExtractForm'
})
</script>