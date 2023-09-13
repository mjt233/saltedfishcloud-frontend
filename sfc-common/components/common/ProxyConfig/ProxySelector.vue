<template>
  <div class="proxy-selector">
    <LoadingMask type="circular" :loading="loading" />
    <v-select
      v-model="curSelect"
      class="hide-details no-padding"
      color="primary"
      :items="proxyItems"
      item-title="title"
      item-value="value"
      :hide-details="true"
      density="comfortable"
      label="选择代理节点"
      variant="underlined"
      no-data-text="无可用代理"
    >
      <template #item="{ props: itemProps, item }">
        <v-list-item v-bind="itemProps" :title="`${item.raw.uid == 0 ? '【公共代理】' : ''}${item.raw.title}` ">
          <template #append>
            <ProxyTestStatus :status="tester.getReactiveResult()[item.raw.id]" />
          </template>
        </v-list-item>
      </template>
    </v-select>
  </div>
</template>

<script setup lang="ts">
const curSelect = ref()
const lm = new LoadingManager()
const loading = lm.getLoadingRef()
const items = ref<ProxyInfo[]>([])
const props = defineProps({
  modelValue: {
    type: [Number, String] as PropType<IdType>,
    default: undefined
  }
})
const emits = defineEmits<{
  (e: 'update:modelValue', v: IdType): void
}>()

const tester = createProxyTester()

const actions = MethodInterceptor.createAsyncActionProxy({
  async loadList() {
    items.value = (await SfcUtils.request(API.task.download.getProxy())).data.data
    if (items.value.length) {
      tester.testAllProxy(items.value, true)
    }
    return
  }
}, true, lm)

const proxyItems = computed(() =>
  items.value.map(proxy => {
    return {
      title: proxy.name,
      value: proxy.id,
      uid: proxy.uid,
      id: proxy.id
    }
  }).sort((a, b) => Number(b.uid) -  Number(a.uid))
)

const proxyPublicItems = computed(() => items.value.filter(proxy => proxy.uid == 0).map(proxy => {
  return {
    title: '【公共代理】' + proxy.name,
    value: proxy.id,
    uid: proxy.uid,
    id: proxy.id
  }
}))

const proxyPrivateItems = computed(() => items.value.filter(proxy => proxy.uid != 0).map(proxy => {
  return {
    title: proxy.name,
    value: proxy.id,
    uid: proxy.uid,
    id: proxy.id
  }
}))

watch(curSelect, () => {
  if (props.modelValue != curSelect.value) {
    emits('update:modelValue', curSelect.value)
  }
})

watch(() => props.modelValue, () => {
  if (props.modelValue != curSelect.value) {
    curSelect.value = props.modelValue
  }
})

onMounted(() => {
  actions.loadList()
})
</script>

<script lang="ts">
import { API } from 'sfc-common/index'
import { IdType, ProxyInfo } from 'sfc-common/model'
import { LoadingManager, MethodInterceptor } from 'sfc-common/utils'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { LoadingMask } from '..'
import { watch } from 'vue'
import { onMounted } from 'vue'
import { computed } from 'vue'
import { createProxyTester } from './ProxyTester'
import ProxyTestStatus from './ProxyTestStatus.vue'

export default defineComponent({
  name: 'ProxySelector'
})
</script>

<style scoped>
.proxy-selector {
  position: relative;
}
</style>