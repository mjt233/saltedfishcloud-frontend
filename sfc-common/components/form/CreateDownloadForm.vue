<template>
  <base-form
    ref="form"
    v-model="formData"
    :submit-action="actions.createTask"
  >
    <loading-mask :loading="loading" />
    <FormRow>
      <FormCol>
        <text-input
          ref="urlRef"
          v-model="formData.url"
          label="URL-下载地址，仅支持http(s)"
          :rules="validators.url"
          @keypress.enter="emitSubmit"
        />
      </FormCol>
    </FormRow>
    <FormRow>
      <FormCol style="min-height: 48px;">
        <p class="text-title" style="margin-top: 12px;">
          其他选项
        </p>
      </FormCol>
    </FormRow>
    <FormRow>
      <FormCol>
        <v-switch v-model="formData.useProxy" label="使用代理" color="primary" />
      </FormCol>
    </FormRow>
    <FormRow>
      <FormCol>
        <proxy-selector v-if="formData.useProxy" v-model="formData.proxy" />
      </FormCol>
    </FormRow>
  </base-form>
</template>

<script setup lang="ts">
import TextInput from '../common/TextInput.vue'
import BaseForm from '../common/BaseForm.vue'
import LoadingMask from '../common/LoadingMask.vue'
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
const urlRef = ref() as Ref<ComponentPublicInstance>
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()
const formData = reactive({
  url: '',
  proxy: '',
  useProxy: false,
  savePath: props.savePath
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
const proxys: ProxyInfo[] = reactive([])
const proxyOptions = computed(() => {
  return proxys.map(proxy => {
    return {
      title: proxy.name,
      value: proxy.id + ''
    } as SelectOption
  })
})
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
        proxys.push({
          ...e,
          name: e.uid == 0 ? `【公共代理】${e.name}` : `${e.name}`
        })
      })
    }
  }
  , loadingManager
  )
  ,true
)
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
import API from 'sfc-common/api'
import { MethodInterceptor } from 'sfc-common/utils/MethodInterceptor'
import { LoadingManager } from 'sfc-common/utils/LoadingManager'
import { CommonForm, deconstructForm } from 'sfc-common/utils/FormUtils'
import { Validators } from 'sfc-common/core/helper/Validators'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import FormSelect from '../common/FormSelect.vue'
import { ProxyInfo, SelectOption } from 'sfc-common/model'
import { computed } from 'vue'
import propsOptions from '../common/FileList/props'
import ProxySelector from '../common/ProxyConfig/ProxySelector.vue'

export default defineComponent({
  name: 'CreateDownloadForm'
})
</script>