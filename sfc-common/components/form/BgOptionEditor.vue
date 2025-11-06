<template>
  <FormGrid :style="{'max-width': maxWidth}">
    <FormRow>
      <FormCol class="mw-50">
        <VSwitch
          v-model="valueObj.enabled"
          color="primary"
          label="启用背景图"
          hide-details
        />
      </FormCol>
      <FormCol class="mw-50" label="不透明度">
        <v-slider
          style="margin-top: 12px"
          :model-value="(valueObj.operacity || 0.9)*100"
          :min="1"
          :max="100"
          :step="1"
          thumb-label
          color="primary"
          @update:model-value="valueObj.operacity = $event / 100"
        >
          <template #thumb-label="{ modelValue: v }">
            {{ v + '%' }}
          </template>
        </v-slider>
      </FormCol>
      <FormCol class="mw-50">
        <FormSelect v-model="valueObj.size" placeholder="尺寸" :items="sizeOptions" />
      </FormCol>
      <FormCol class="mw-50">
        <div class="d-flex align-center">
          <TextInput v-model="valueObj.url" label="图片url" hide-details />
          <VBtn size="small" class="ml-3" @click="selectImgFile">
            浏览
          </VBtn>
        </div>
      </FormCol>
      <FormRow>
        <FormCol>
          <VSwitch
            v-model="usePreview"
            class="ml-3"
            color="primary"
            label="实时预览"
          />
        </FormCol>
      </FormRow>
    </FormRow>
  </FormGrid>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: [String, Object] as PropType<String | BgOption>,
    default: undefined
  },
  /**
   * modelValue是否使用json字符串类型
   */
  useJson: {
    type: Boolean,
    default: false
  },
  maxWidth: {
    type: String,
    default: '640px'
  }
})
const emits = defineEmits(['update:modelValue'])

const sizeOptions: SelectOption[] = [
  {
    title: 'cover',
    value: 'cover'
  },
  {
    title: 'contain',
    value: 'contain'
  },
  {
    title: 'auto',
    value: 'auto'
  }
]

/**
 * 当前的配置对象
 */
let valueObj: BgOption = reactive(getDefaultObj())

/**
 * 系统当前的原始背景图配置
 */
let originBgOption = getContext().bg.value.main

/** 上次选择图片文件时文件的所在路径 */
let lastSelectPath: string = '/'

/**
 *是否开启实时预览
 */
const usePreview: Ref<boolean> = ref(true)

function getDefaultObj() {
  return {
    enabled: false,
    operacity: 0.9,
    size: 'cover',
    url: ''
  } as BgOption
}

async function selectImgFile() {
  const selectResult = await SfcUtils.selectFile({
    uid: 0,
    path: lastSelectPath,
    filter: () => true,
    requireFile: true,
  })
  valueObj.url = selectResult.fileListContext.getFileUrl(selectResult.file[0])
  lastSelectPath = selectResult.path
}

const initObj = () => {
  if (props.useJson) {
    Object.assign(valueObj, JSON.parse(props.modelValue as string))
  } else {
    Object.assign(valueObj, props.modelValue as BgOption)
  }
}
const emitVal = () => {
  if (props.useJson) {
    emits('update:modelValue', JSON.stringify(valueObj))
  } else {
    emits('update:modelValue', valueObj)
  }
}

/**
 * 配置变更监听器，确保实时更新系统当前的原始图配置
 */
let configChangeListener = (changeList: ConfigNodeModel[]) => {
  const config = changeList.find(e => e.name == 'sys.bg.main')
  if (config) {
    originBgOption = JSON.parse(config.value)
  }
}

watch(usePreview, () => {
  if (usePreview.value) {
    getContext().bg.value.main = valueObj
  } else {
    getContext().bg.value.main = originBgOption
  }
})
watch(valueObj, e => {
  emitVal()
  if (usePreview.value) {
    getContext().bg.value.main = valueObj
  }
})

onMounted(() => {
  initObj()
  getContext().eventBus.value.on(EventNameConstants.SYS_CONFIG_CHANGE, configChangeListener)
})
onUnmounted(() => {
  getContext().eventBus.value.off(EventNameConstants.SYS_CONFIG_CHANGE, configChangeListener)
})
</script>

<script lang="ts">
import { BgOption, getContext } from 'sfc-common/core/context'
import { ConfigNodeModel, SelectOption } from 'sfc-common/model'
import { FormGrid, FormRow, FormCol } from '../layout'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { EventNameConstants } from 'sfc-common/core/constans/EventName'
import { MethodInterceptor } from 'sfc-common/utils'

export default defineComponent({
  name: 'BgOptionEditor'
})
</script>

<style scoped>
.dense-form .v-col {
  min-width: 280px;
}
</style>