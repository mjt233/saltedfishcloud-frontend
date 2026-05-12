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
      :clearable="clearable"
      :rules="rules"
    >
      <template #item="{ props: itemProps, item }">
        <v-list-item v-bind="itemProps">
          <template #prepend>
            <CommonIcon
              :icon="item.uid == 0 ? 'mdi-earth' : 'mdi-account'"
              :title="item.uid == 0 ? '公共代理' : '自定义代理'"
              class="mr-1" 
            />
          </template>
          <template #title>
            {{ item.title }}
            <CommonIcon
              v-if="item.isProtect"
              title="该代理不公开使用"
              icon="mdi-key"
            />
          </template>
          <template #append>
            <ProxyTestStatus :status="tester.getReactiveResult()[item.id]" />
          </template>
        </v-list-item>
      </template>
      <template #append-item>
        <v-divider class="mb-2" />
        <v-list-item
          title="代理配置"
          subtitle="快捷调整您的代理配置"
          @click="toManager" 
        >
          <template #prepend>
            <CommonIcon icon="mdi-open-in-app" class="mr-1" />
          </template>
        </v-list-item>
        <v-list-item
          v-if="refreshable"
          title="刷新"
          :disabled="loading"
          @click="actions.loadList"
        >
          <template #prepend>
            <CommonIcon icon="mdi-refresh" class="mr-1" />
          </template>
        </v-list-item>
      </template>
    </v-select>
    <!-- <span class="link ml-2" @click="toManager">管理代理节点</span> -->
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
  },

  /**
   * 是否可转跳编辑
   */
  editable: {
    type: Boolean,
    default: false
  },

  /**
   * 是否可清空选择
   */
  clearable: {
    type: Boolean,
    default: false
  },

  /**
   * 是否可手动刷新
   */
  refreshable: {
    type: Boolean,
    default: false
  },

  /**
   * 代理节点的下拉选择组件表单校验规则
   */
  rules: {
    type: Array as PropType<(string | ((v: any) => boolean | string))[]>,
    default: () => []
  }
})
const emits = defineEmits<{
  /**
   * 节点选择变更事件
   */
  (e: 'update:modelValue', v: IdType): void,

  
  /**
   * 节点选择变更事件，不过事件对象参数用的是整个选择的代理对象
   */
  (e: 'proxySelect', v?: ProxyInfo): void

  /**
   * 代理列表加载完成事件
   */
  (e: 'listLoaded', v: ProxyInfo[]): void
}>()
const isAdmin = getContext().session.value.user.role == 'admin'

const tester = createProxyTester()

const actions = MethodInterceptor.createAsyncActionProxy({
  async loadList() {
    items.value = (await SfcUtils.request(API.task.download.getProxy())).data.data
    if (items.value.length) {
      tester.testAllProxy(items.value, true)
    }
    emits('listLoaded', items.value)
    return
  }
}, true, lm)

const proxyItems = computed(() =>
  items.value.map(proxy => {
    return {
      title: proxy.name,
      value: proxy.id,
      uid: proxy.uid,
      id: proxy.id,
      isProtect: proxy.isProtect
    }
  }).sort((a, b) => Number(b.uid) -  Number(a.uid))
)

function toManager() {
  SfcUtils.openComponentDialog(ProxyManager, {
    title: '代理节点管理',
    showConfirm: false,
    extraDialogOptions: {
      dense: true,
      cancelText: '关闭',
      maxWidth: '860px'
    }
  })
    .finally(actions.loadList)  
}

watch(curSelect, () => {
  if (props.modelValue != curSelect.value) {
    emits('update:modelValue', curSelect.value)
    emits('proxySelect', items.value.find(proxy => proxy.id == curSelect.value))
  }
})

watch(() => props.modelValue, () => {
  if (props.modelValue != curSelect.value) {
    curSelect.value = props.modelValue
  }
})

onMounted(async() => {
  await actions.loadList()
  curSelect.value = props.modelValue
})
</script>

<script lang="ts">
import API from 'sfc-common/api'
import { IdType, ProxyInfo } from 'sfc-common/model'
import { LoadingManager, MethodInterceptor } from 'sfc-common/utils'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, h } from 'vue'
import { LoadingMask } from '..'
import { watch } from 'vue'
import { onMounted } from 'vue'
import { computed } from 'vue'
import { createProxyTester } from './ProxyTester'
import ProxyTestStatus from './ProxyTestStatus.vue'
import ProxyManager from './ProxyManager.vue'
import CommonIcon from '../CommonIcon.vue'
import { getContext } from 'sfc-common/core'

export default defineComponent({
  name: 'ProxySelector'
})
</script>

<style scoped>
.proxy-selector {
  position: relative;
  display: flex;
  align-items: center;
}
</style>