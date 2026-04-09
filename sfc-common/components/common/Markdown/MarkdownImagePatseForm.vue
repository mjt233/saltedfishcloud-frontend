<template>
  <base-form ref="formRef" :model-value="formData" :submit-action="actions.submit">
    <template v-if="showTitle">
      <VRow class="mb-4">
        <div class="text-h5 tip">
          图片粘贴设置
        </div>
        <VDivider />
      </VRow>
    </template>
    <div>
      <div class="tip mb-2">
        路径定位方式
      </div>
      <v-radio-group
        v-model="formData.location"
        color="primary"
      >
        <v-radio
          label="相对当前文件位置"
          value="1"
        />
        <v-radio
          label="固定位置"
          value="2"
        />
      </v-radio-group>
    </div>
    <div class="d-flex align-center">
      <VTextField v-model="formData.path" :rules="validators.path" label="图片保存路径" />
      <VBtn
        v-if="formData.location == '2'"
        variant="text"
        class="ml-2"
        @click="selectDirPath"
      >
        浏览
      </VBtn>
    </div>
    <VCheckbox
      v-model="formData.alwayConfirm"
      label="每次粘贴图片前询问"
      hide-details
      color="primary"
    />
  </base-form>
</template>

<script setup lang="ts">
import { CommonForm, defineForm, FormFieldType, getContext, Validators } from 'sfc-common'
import SfcUtils from 'sfc-common/utils/SfcUtils'
const formRef = ref() as Ref<CommonForm>
const emits = defineEmits(['submit'])
const props = defineProps({
  showTitle: {
    type: Boolean,
    default: true
  }
})
let inited = false

const getDefaultConfig = () => ({
  location: '1',
  path: './img',
  alwayConfirm: true
} as ImagePatseOption)

const initConfig = async() => {
  const localConfig = localStorage.getItem(CONFIG_KEY)
  if (!localConfig) {
    Object.assign(formData, getDefaultConfig())
    await nextTick()
    inited = true
    return
  }

  try {
    const configObj = JSON.parse(localConfig)
    Object.assign(formData, configObj)
  } catch (err) {
    localStorage.removeItem(CONFIG_KEY)
  } finally {
    await nextTick()
    inited = true
  }
}

const selectDirPath = async() => {
  try {
    const path = await SfcUtils.selectPath({
      uid: getContext().session.value.user.id,
      path: formData.path,
      readOnly: false
    })
    formData.path = path
  } catch (ignore) {}
}
const formInst = defineForm({
  actions: {
    submit() {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(formData))
    }
  },
  formData: getDefaultConfig() as ImagePatseOption,
  formRef: formRef,
  validators: {
    path: [
      Validators.notNull('路径不能为空'),
      (e:FormFieldType) => {
        if (formData.location == '1' && !formData.path.startsWith('./')) {
          return '使用当前路径时必须以"./"开头'
        } else if (formData.location == '2' && formData.path.startsWith('./')) {
          return '使用指定路径时不能以"./"开头'
        }
        if (formData.path.indexOf('../') >= 0 || formData.path.indexOf('/../') >= 0 || formData.path.match(/\.\.$/) || formData.path == '..' ) {
          return '路径不能包含..'
        }
        return true
      }
    ]
  },
  throwError: true
})
const { formData, actions, validators, loadingRef, loadingManager  } = formInst


defineExpose(formInst)

onMounted(() => {
  initConfig()
  watch(() => formData.location, () => {
    if (inited) {
      if (formData.location == '1') {
        formData.path = './img'
      } else {
        formData.path = '/'
      }
    }
  })
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, reactive, onMounted, watch, nextTick } from 'vue'
import { CONFIG_KEY } from './constants'
import { ImagePatseOption } from './type'

export default defineComponent({
  name: 'MarkdownImagePatseForm'
})
</script>