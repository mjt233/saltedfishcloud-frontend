<template>
  <base-form
    ref="form"
    v-model="formData"
    :submit-action="actions.createTask"
  >
    <loading-mask :loading="loading" />
    <v-row>
      <v-col cols="12">
        <v-text-field
          ref="urlRef"
          v-model="formData.url"
          label="URL"
          placeholder="文件下载地址 - 仅支持http(s)"
          :rules="validators.url"
          @keypress.enter="emitSubmit"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <path-selector
          v-model="formData.savePath"
          :uid="props.uid"
          label="文件保存路径"
          dialog-title="选择下载保存路径"
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
          @update:model-value="($event) => { if (!$event) { formData.proxy = '' } } "
        />
      </v-col>
      <v-col v-if="formData.useProxy" cols="12" md="9">
        <proxy-selector v-model="formData.proxy" :rules="validators.proxy" />
      </v-col>
    </v-row>
  </base-form>
</template>

<script setup lang="ts">
import BaseForm from '../common/BaseForm.vue'
import LoadingMask from '../common/LoadingMask.vue'
const props = defineProps({
  uid: {
    type: [Number, String] as PropType<number | string>,
    default: 0
  },
  savePath: {
    type: String,
    default: '/'
  }
})
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()
let formData = reactive({
  url: '',
  proxy: '',
  useProxy: false,
  savePath: props.savePath
})
const form = ref() as Ref<CommonForm>
const validators = {
  url: [
    Validators.notNull('url不能为空'),
    Validators.isUrl('url格式无效')
  ],
  proxy: [
    Validators.notNull('代理节点不能为空')
  ]
}
const actions = MethodInterceptor.createAsyncActionProxy({
  async createTask() {
    const conf = API.task.download.create({
      method: 'GET',
      uid: props.uid,
      savePath: formData.savePath,
      url: formData.url,
      proxy: formData.useProxy ? formData.proxy : ''
    })
    return await SfcUtils.request(conf)
  },
}, true, loadingManager)

const formInst = deconstructForm(form)
const emit = defineEmits(['submit'])
const emitSubmit = async() => {
  const result = await formInst.validate()
  if (result.valid) {
    emit('submit')
  }
}
defineExpose(formInst)

onMounted(() => {
  formData.savePath = props.savePath
})
</script>

<script lang="ts">
import { defineComponent, reactive, ref, defineProps, defineExpose, defineEmits, Ref, ComponentPublicInstance, PropType, onMounted } from 'vue'
import API from 'sfc-common/api'
import { MethodInterceptor } from 'sfc-common/utils/MethodInterceptor'
import { LoadingManager } from 'sfc-common/utils/LoadingManager'
import { CommonForm, deconstructForm } from 'sfc-common/utils/FormUtils'
import { Validators } from 'sfc-common/core/helper/Validators'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { ProxyInfo, SelectOption } from 'sfc-common/model'
import { computed } from 'vue'
import ProxySelector from '../common/ProxyConfig/ProxySelector.vue'
import PathSelector from '../common/PathSelector.vue'

export default defineComponent({
  name: 'CreateDownloadForm'
})
</script>