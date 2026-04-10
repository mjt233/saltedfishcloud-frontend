<template>
  <VSheet style="position: relative;" elevation="1" class="mt-2">
    <LoadingMask :loading="isLoading" />
    <VList>
      <VListItem
        v-for="item in configArr"
        :key="item.name"
        :title="item.name"
      >
        <VTextField
          v-model="item.value"
          type="number"
          :name="item.name"
          :placeholder="`${item.name}源文件大小限制（MiB，默认32，-1无限制）`"
          density="compact"
          @update:model-value="updateConfig"
        />
      </VListItem>
    </VList>
  </VSheet>
</template>

<script setup lang="ts">
interface NameValueType {
  name: string
  value: string
}
const props = defineProps({
  /**
   * 配置项的json值。反序列化类型为：NameValueType[]
   */
  modelValue: {
    type: String,
    default: ''
  },
})
const emit = defineEmits(['update:modelValue'])
const configArr = ref<NameValueType[]>([])

const { isLoading, loadingManager } = useLoadingManager()
const actions = MethodInterceptor.createAsyncActionProxy({
  async loadHandlerNames(): Promise<string[]> {
    return (await SfcUtils.request(API.admin.sys.getThumbnailHandlerNames())).data.data
  }
}, true, loadingManager)

function updateConfig() {
  emit('update:modelValue', JSON.stringify(configArr.value))
}

onMounted(async() => {
  const handlerNames = await actions.loadHandlerNames()
  const existingConfig: Record<string, string> = props.modelValue ? JSON.parse(props.modelValue) : {}
  
  // 转换为map便于查找
  const configMap: Record<string, string> = {}
  if (Array.isArray(existingConfig)) {
    existingConfig.forEach((item: NameValueType) => {
      configMap[item.name] = item.value
    })
  }
  
  // 为每个handler名称创建配置项
  configArr.value = handlerNames.map(name => ({
    name,
    value: configMap[name] || ''
  }))
})
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'
import { LoadingMask } from '../common'
import { useLoadingManager } from 'sfc-common/composables/useLoadingManager'
import { MethodInterceptor } from 'sfc-common/utils'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import API from 'sfc-common/api'

export default defineComponent({
  name: 'SysThumbnailResourceSizeConfig'
})
</script>