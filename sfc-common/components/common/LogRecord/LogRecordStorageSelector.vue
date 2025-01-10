<template>
  <div class="log-record-storage-selector">
    <FormSelect
      :model-value="modelValue"
      :return-object="false"
      :items="storageItemOptions"
      :placeholder="placeholder === undefined ? '用于日志信息的存储与查询' : undefined"
      :multiple="multiple"
      :loading="isLoading"
      @update:model-value="emits('update:modelValue', $event)"
    />
  </div>
  
</template>

<script setup lang="ts">
const props = defineProps({
  /**
   * 日志存储器列表
   */
  storageList: {
    type: Array as PropType<string[]>,
    default: undefined
  },
  /**
   * 当日志存储器列表storageList为空时，是否自动加载
   */
  autoLoad: {
    type: Boolean,
    default: true
  },
  modelValue: {
    type: String,
    default: undefined
  },
  placeholder: {
    type: String,
    default: undefined
  },
  multiple: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits<{
  /**
   * 存储器列表完成自动加载
   */
  (e: 'storageListLoaded', v: LogRecordStorage[]): void
  (e: 'update:modelValue', v: string): void
}>()
const storageItems = ref<LogRecordStorage[]>([])
const storageItemOptions = computed(() => storageItems.value.map(s => {
  return {
    title: s.name,
    value: s.value
  } as SelectOption
}))
const lm = new LoadingManager()
const isLoading = lm.getLoadingRef()
const actions = MethodInterceptor.createAsyncActionProxy({
  async loadList() {
    storageItems.value = (await SfcUtils.request(API.admin.logRecord.listStorage())).data.data
    emits('storageListLoaded', storageItems.value)
    return storageItems.value
  }
}, true, lm)

onMounted(async() => {
  if (!props.storageList) {
    await actions.loadList()
  }
})

</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed, onMounted } from 'vue'
import FormSelect from '../FormSelect.vue'
import { SelectOption } from 'sfc-common/model'
import LoadingMask from '../LoadingMask.vue'
import { LoadingManager, MethodInterceptor } from 'sfc-common/utils'
import API from 'sfc-common/api'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { LogRecordStorage } from 'sfc-common/model/LogRecord'

export default defineComponent({
  name: 'LogRecordStorageSelector'
})
</script>

<style lang="scss" scoped>
.log-record-storage-selector {
  display: inline-block;
  max-width: 360px;
  width: 100%;
}
</style>