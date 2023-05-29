<template>
  <div style="position: relative; width: 100%; min-height: 300px;">
    <loading-mask :type="'circular'" :loading="loading" />
    <div v-if="shareInfo" :class="{'code-input-card': !shareInfo.validateSuccess}">
      <!-- 文件提取 -->
      <v-card style="overflow: hidden">
        <loading-mask :loading="loading" />
        <template #prepend>
          <user-avatar :uid="shareInfo.uid" :name="shareInfo.username" />
        </template>
        <template #title>
          {{ shareInfo.username }}的分享：{{ shareInfo.name }}
        </template>
        <template #subtitle>
          创建于：{{ toDate(shareInfo.createdAt) }}
        </template>
        <v-card-content v-if="!shareInfo.validateSuccess">
          <form-grid style="padding: 12px 0">
            <v-row
              class="form-row justify-center" 
              style="margin-bottom: 12px"
            >
              <v-col>
                <text-input
                  ref="codeInputRef"
                  v-model="inputExtractCode"
                  label="请输入提取码"
                  :rules="[ e => invalidCode ? '提取码错误' : true ]"
                  @enter="extract"
                />
                <v-btn color="primary" style="margin-left: 16px" @click="extract">
                  提取文件
                </v-btn>
              </v-col>
            </v-row>
          </form-grid>
        </v-card-content>
        <v-card-content v-else>
          <!-- 文件提取成功，文件浏览界面 -->
          <file-share-dir-browser
            v-if="shareInfo.type == 'DIR'"
            :share-info="shareInfo"
            :path="path"
            @update:path="emits('update:path', $event)"
          />
          <file-share-file-extractor v-if="shareInfo.type == 'FILE'" :share-info="shareInfo" />
        </v-card-content>
      </v-card>
    </div>
    <not-found-tip v-if="isError" :text="errorText" />
  </div>
</template>

<script setup lang="ts">
import LoadingMask from '../../LoadingMask.vue'
import { UserAvatar } from 'sfc-common/components'
import FormGrid from 'sfc-common/components/layout/FormGrid.vue'
import TextInput from '../../TextInput.vue'
import FileShareDirBrowser from './FileShareDirBrowser.vue'
import FileShareFileExtractor from './FileShareFileExtractor.vue'
import NotFoundTip from '../../NotFoundTip.vue'
const codeInputRef = ref()
const props = defineProps({
  /**
   * 分享id
   */
  sid: {
    type: [Number, String],
    default: 0
  },
  /**
   * 分享校验码
   */
  vid: {
    type: String,
    default: ''
  },
  /**
   * 提取码
   */
  extractCode: {
    type: String,
    default: undefined
  },
  path: {
    type: String,
    default: '/'
  }
})
const emits = defineEmits(['update:path'])
provide('protocol', 'share')
provide('protocolParams', () => {
  return {
    code: props.extractCode,
    vid: props.vid,
    id: props.sid
  } as ProtocolParams
})
const toDate = StringFormatter.toDate
const inputExtractCode = ref('')
const loadingManager = new LoadingManager()
const loading = loadingManager.getLoadingRef()
const isError = ref(false)
// 提取码是否无效
const invalidCode = ref(false)

const errorText = ref('')

const shareInfo = ref() as Ref<ShareInfo>
const actions = MethodInterceptor.createAsyncActionProxy({
  async getShareInfo() {
    try {
      shareInfo.value = await ShareService.getShareInfo(props.sid, props.vid, props.extractCode || inputExtractCode.value || null)
      shareInfo.value.verification = props.vid
    } catch (err) {
      isError.value = true
      errorText.value = (err as any).toString()
      SfcUtils.snackbar(err)
    }
  }
}, false, loadingManager)

const extract = async() => {
  await actions.getShareInfo()
  if(!shareInfo.value.validateSuccess) {
    SfcUtils.snackbar('提取码错误')
    invalidCode.value = true
    codeInputRef.value.validate()
  }
}

onMounted(() => {
  actions.getShareInfo()
})
</script>

<script lang="ts">
import { ShareInfo } from 'sfc-common/api/share'
import { ShareService } from 'sfc-common/core/serivce/ShareService'
import { LoadingManager } from 'sfc-common/utils/LoadingManager'
import { MethodInterceptor } from 'sfc-common/utils/MethodInterceptor'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, provide } from 'vue'
import { StringFormatter } from 'sfc-common/utils/StringFormatter'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { AxiosError } from 'axios'
import { ProtocolParams } from 'sfc-common/model'

export default defineComponent({
  name: 'FileShareExtractor'
})
</script>

<style>
.code-input-card {
  max-width: 640px;
  margin: 0 auto;
}
</style>