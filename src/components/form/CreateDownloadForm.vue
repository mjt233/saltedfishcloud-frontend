<template>
  <base-form
    ref="form"
    v-model="formData"
    :submit-action="actions.createTask"
  >
    <loading-mask :loading="loading" />
    <text-input
      ref="urlRef"
      v-model="formData.url"
      label="URL-下载地址，仅支持http(s)"
      :rules="validators.url"
      @keypress.enter="emitSubmit"
    />
    <v-row>
      <v-col style="max-width: 160px">
        <v-switch v-model="formData.useProxy" label="使用代理" color="primary" />
      </v-col>
      <v-col>
        <v-select
          v-if="formData.useProxy"
          v-model="formData.proxy"
          color="primary"
          :items="proxys"
          label="选择节点"
          variant="underlined"
          no-data-text="无可用代理"
        />
      </v-col>
    </v-row>
    
    
  </base-form>
</template>

<script setup lang="ts">
import TextInput from '../common/TextInput.vue'
import BaseForm from '../common/BaseForm.vue'
import LoadingMask from '../common/LoadingMask.vue'
const urlRef = ref() as Ref<ComponentPublicInstance>
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()
const formData = reactive({
  url: '',
  proxy: '',
  useProxy: false
})
const form = ref() as Ref<CommonForm>
const validators = {
  url: [Validators.notNull('url不能为空'), (url: string) => {
    try {
      new URL(url)
    } catch (err) {
      return 'url格式无效'
    }
    return true
  }]
}
const proxys: string[] = reactive([])
const actions = MethodInterceptor.createAutoCatch(
  MethodInterceptor.createAutoLoadingProxy({
    async createTask() {
      const conf = API.task.download.create({
        method: 'GET',
        uid: props.uid,
        savePath: props.savePath,
        url: formData.url,
        proxy: formData.useProxy ? formData.proxy : ''
      })
      return await SfcUtils.request(conf)
    },
    async loadProxy() {
      (await SfcUtils.request(API.task.download.getProxy())).data.data.forEach(e => {
        proxys.push(e.name)
      })
    }
  }
  , loadingManager
  )
  ,true
)
const props = defineProps({
  uid: {
    type: Number,
    default: 0
  },
  savePath: {
    type: String,
    default: '/'
  }
})
const formInst = deconstructForm(form)
const emit = defineEmits(['submit'])
const emitSubmit = async() => {
  const result = await formInst.validate()
  if (result.valid) {
    emit('submit')
  }
}
defineExpose(formInst)
actions.loadProxy()
</script>

<script lang="ts">
import { defineComponent, reactive, ref, defineProps, defineExpose, defineEmits, Ref, ComponentPublicInstance } from 'vue'
import API from '@/api'
import { MethodInterceptor } from '@/utils/MethodInterceptor'
import { LoadingManager } from '@/utils/LoadingManager'
import { CommonForm, deconstructForm } from '@/utils/FormUtils'
import { Validators } from '@/core/helper/Validators'
import SfcUtils from '@/utils/SfcUtils'

export default defineComponent({
  name: 'CreateDownloadForm'
})
</script>