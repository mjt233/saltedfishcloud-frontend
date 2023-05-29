<template>
  <base-form ref="formRef" :model-value="formData" :submit-action="actions.submit">
    <VContainer>
      <template v-if="showTitle">

        <div class="text-h6">
          图片粘贴设置
        </div>
        <VDivider />
      </template>
      <form-row style="margin-top: 12px;">
        <form-col top-label label="位置">
          <v-radio-group v-model="formData.location" inline hide-details>
            <v-radio
              color="primary"
              label="文件当前位置"
              value="1"
            />
            <v-radio
              color="primary"
              label="指定位置"
              value="2"
            />
          </v-radio-group>
        </form-col>
        <form-col top-label label="路径">
          <TextInput v-model="formData.path" :rules="validators.path" />
          <VBtn
            v-if="formData.location == '2'"
            size="small"
            flat
            @click="selectDirPath"
          >
            浏览
          </VBtn>
        </form-col>
        <form-col top-label label="其他">
          <VCheckbox
            v-model="formData.alwayConfirm"
            label="每次上传前询问"
            hide-details
            color="primary"
          />
        </form-col>
      </form-row>
    </VContainer>
  </base-form>
</template>

<script setup lang="ts">
import { CommonForm, context, defineForm, FormFieldType, Validators } from 'sfc-common'
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
  path: './',
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
      uid: context.session.value.user.id,
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