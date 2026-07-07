<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-text-field
          ref="urlRef"
          v-model="formData.url"
          label="URL"
          placeholder="文件下载地址 - 仅支持http(s)"
          :rules="urlRules"
          @keypress.enter="emitSubmit"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <path-selector
          v-model="formData.savePath"
          :uid="uid"
          editable
          hint="文件保存的网盘路径，默认为根目录"
          persistent-hint
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="pb-0">
        <div class="text-subtitle-1 font-weight-bold text-primary">
          其他选项
        </div>
      </v-col>
    </v-row>
    <v-row align="center">
      <v-col cols="12" md="3">
        <v-switch
          v-model="formData.useProxy"
          label="使用代理"
          color="primary"
          hide-details
          @update:model-value="($event: boolean | null) => { if (!$event) { formData.proxy = '' } }"
        />
      </v-col>
      <v-col v-if="formData.useProxy" cols="12" md="9">
        <v-select
          v-model="formData.proxy"
          :items="proxyList"
          item-title="name"
          item-value="name"
          label="代理节点"
          :rules="formData.useProxy ? [ (v: string) => !!v || '代理节点不能为空' ] : []"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { downloadApi } from '../api'

const SfcUtils = window.SfcUtils

/**
 * 创建下载任务表单 Props
 */
const props = defineProps({
  uid: {
    type: [Number, String],
    default: 0
  },
  savePath: {
    type: String,
    default: '/'
  }
})

const formData = reactive({
  url: '',
  proxy: '',
  useProxy: false,
  savePath: props.savePath
})

import type { ProxyInfo } from '../model'
const PathSelector = window.components.PathSelector

const proxyList = ref<ProxyInfo[]>([])
const urlRef = ref<{ focus: () => void }>()

const urlRules = [
  (v: string) => !!v || 'URL不能为空',
  (v: string) => {
    try {
      new URL(v)
      return true
    } catch {
      return 'URL格式无效'
    }
  }
]

const emit = defineEmits(['submit'])

/**
 * 提交创建任务
 */
const submit = async() => {
  if (!formData.url) {
    SfcUtils.snackbar('请输入下载URL')
    return { success: false }
  }
  try {
    const conf = downloadApi.create({
      method: 'GET',
      uid: props.uid,
      savePath: formData.savePath,
      url: formData.url,
      proxy: formData.useProxy ? formData.proxy : ''
    })
    await SfcUtils.request(conf)
    SfcUtils.snackbar('创建下载任务成功')
    return { success: true }
  } catch (err) {
    console.error(err)
    SfcUtils.snackbar('创建下载任务失败')
    return { success: false }
  }
}

/**
 * 回车提交
 */
const emitSubmit = async() => {
  if (formData.url) {
    emit('submit')
  }
}

/**
 * 加载代理列表
 */
const loadProxyList = async() => {
  try {
    const res = await SfcUtils.request(downloadApi.getProxy())
    const data = res.data as { data: ProxyInfo[] }
    proxyList.value = data.data || []
  } catch {
    // 忽略加载代理列表错误
  }
}

defineExpose({ submit, formData })

onMounted(() => {
  formData.savePath = props.savePath
  loadProxyList()
})
</script>
