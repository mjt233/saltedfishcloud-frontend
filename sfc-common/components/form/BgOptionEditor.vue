<template>
  <div>
    <!-- 主图设定 -->
    <VCard max-width="810px" class="mt-4">
      <VCardTitle class="pt-0">
        <VTabs v-model="curTab" color="primary">
          <VTab value="img">
            背景图片
          </VTab>
          <VTab value="effect">
            效果微调
          </VTab>
        </VTabs>
      </VCardTitle>
      <VCardText>
        <VWindow v-model="curTab" disabled class="pt-2 pl-2 pr-2">
          <VWindowItem value="img">
            <VSwitch
              v-model="valueObj.enabled"
              color="primary"
              label="启用背景图"
            />
            <div class="d-flex align-center">
              <VTextField v-model="valueObj.url" label="图片url" />
              <VBtn size="small" class="ml-3" @click="selectImgFile">
                浏览
              </VBtn>
            </div>
            <VSelect v-model="valueObj.size" :items="['cover', 'contain', 'auto']" label="尺寸" />
          </VWindowItem>
          <VWindowItem value="effect">
            <!-- 预览选项 -->
            <VListItemSubtitle>效果预览</VListItemSubtitle>
            <VDivider class="mt-2" />
            <VSwitch
              v-model="usePreview"
              color="primary"
              label="预览当前效果"
            />
            <VListItemSubtitle class="mt-4">
              主图效果
            </VListItemSubtitle>
            <VDivider class="mt-2 mb-2" />
        
            <VSlider
              v-model="valueObj.globalGassValue"
              step="1"
              min="0"
              max="200"
              thumb-label
            >
              <template #prepend>
                <span class="slider-label">全局模糊</span>
              </template>
            </VSlider>
            <VSlider
              :model-value="(valueObj.operacity || 0.9)*100"
              :min="1"
              :max="100"
              step="1"
              thumb-label
              color="primary"
              @update:model-value="valueObj.operacity = $event / 100"
            >
              <template #prepend>
                <span class="slider-label">不透明度</span>
              </template>
              <template #thumb-label="{ modelValue: v }">
                {{ v + '%' }}
              </template>
            </VSlider>

            
            <VListItemSubtitle class="mt-4">
              局部效果
            </VListItemSubtitle>
            <VDivider class="mt-2" />
            <VSwitch
              v-model="valueObj.enabledCardEffect"
              color="primary"
              label="调整卡片效果"
            />
            <VSlider
              v-if="valueObj.enabledCardEffect"
              v-model="valueObj.cardGassValue"
              thumb-label
              step="1"
              min="0"
              max="200"
            >
              <template #prepend>
                <span class="slider-label">卡片模糊度</span>
              </template>
            </VSlider>
            <VSlider
              v-if="valueObj.enabledCardEffect"
              :model-value="(valueObj.cardOpacity || 0)*100"
              :min="0"
              :max="100"
              step="1"
              thumb-label
              color="primary"
              @update:model-value="valueObj.cardOpacity = $event / 100"
            >
              <template #prepend>
                <span class="slider-label">卡片不透明度</span>
              </template>
              <template #thumb-label="{ modelValue: v }">
                {{ v + '%' }}
              </template>
            </VSlider>

            
            <VSwitch
              v-model="valueObj.enabledDrawerEffect"
              color="primary"
              label="调整抽屉菜单烂效果"
            />
            <VSlider
              v-if="valueObj.enabledDrawerEffect"
              v-model="valueObj.drawerGassValue"
              thumb-label
              step="1"
              min="0"
              max="200"
            >
              <template #prepend>
                <span class="slider-label">抽屉模糊度</span>
              </template>
            </VSlider>
            <VSlider
              v-if="valueObj.enabledDrawerEffect"
              :model-value="(valueObj.drawerOpacity || 0)*100"
              :min="0"
              :max="100"
              step="1"
              thumb-label
              color="primary"
              @update:model-value="valueObj.drawerOpacity = $event / 100"
            >
              <template #prepend>
                <span class="slider-label">抽屉不透明度</span>
              </template>
              <template #thumb-label="{ modelValue: v }">
                {{ v + '%' }}
              </template>
            </VSlider>
          </VWindowItem>
        </VWindow>

      </VCardText>
    </VCard>
  </div>
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
    default: '810px'
  }
})
const emits = defineEmits(['update:modelValue'])
const curTab = ref('img')

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
    readOnly: false
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
.slider-label {
  display: inline-block;
  width: 100px;
}
</style>