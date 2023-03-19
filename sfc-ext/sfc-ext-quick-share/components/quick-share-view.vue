<template>
  <div style="width: 100%;max-width: 810px;margin: 0 auto;padding: 12px;">
    <VCard title="文件极速传">
      <v-tabs
        v-model="tab"
        bg-color="primary"
        color="primary"
      >
        <v-tab value="1">
          <CommonIcon icon="mdi-folder-download" /> 接收文件
        </v-tab>
        <v-tab value="2">
          <CommonIcon icon="mdi-send" /> 发送文件
        </v-tab>
      </v-tabs>
      <VCardContent>
        <VWindow v-model="tab">
          <VWindowItem value="1">
            <VForm ref="extractFormRef">
              <div style="padding: 12px;">
                <v-text-field
                  v-model="extractCode"
                  clearable
                  label="请输入文件提取码"
                  color="primary"
                  :rules="validators.extractCode"
                  variant="underlined"
                />
                <VBtn color="primary" style="display: block;width: 100%;" @click="extract">
                  提取
                </VBtn>
              </div>
            </VForm>
          </VWindowItem>
          <VWindowItem value="2">
            <VForm ref="sendFormRef">
              <div class="tip">
                文件保留时长：{{ context.feature.value[QuickShareApi.feature.effectiveDuration] || 30 }}分钟<br>
                文件大小限制：{{ StringFormatter.toSize(maxSize) }}
              </div>
              <div style="padding: 12px;">
                <v-file-input
                  v-model="file"
                  label="请选择文件"
                  :rules="validators.file" 
                  variant="underlined"
                />
                <v-text-field
                  v-model="sendCode"
                  clearable
                  label="请输入文件提取码"
                  color="primary"
                  :rules="validators.sendCode"
                  variant="underlined"
                />
                <VTextarea
                  v-model="message"
                  :rules="validators.message"
                  label="留言"
                  color="primary"
                  variant="outlined"
                />
                <VBtn color="primary" style="display: block;width: 100%;" @click="sendFile">
                  <CommonIcon icon="mdi-send" /> 发送，走你~
                </VBtn>
              </div>
            </VForm>
          </VWindowItem>
        </VWindow>
      </VCardContent>
    </VCard>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({})

// 标签页
const tab = ref('1')

// 输入- 文件提取码
const extractCode = ref('')
// 输入 - 发送的文件提取码
const sendCode = ref('')
// 输入 - 发送的文件
const file = ref([]) as Ref<File[]>
// 输入 - 留言消息
const message = ref('')

// 发送文件/提取文件的表单实例
const sendFormRef = ref() 
const extractFormRef = ref()

// 默认最大文件大小(MiB)
const defaultMaxSize = 512
const maxSize = (context.feature.value[QuickShareApi.feature.maxSize] || defaultMaxSize) * 1024 * 1024
// 表单各校验器
const validators = {
  sendCode: [Validators.maxLen(null, 20), Validators.minLen(null, 1)],
  extractCode: [Validators.notNull()],
  file: [
    Validators.requireFile(),
    Validators.fileMaxSize(maxSize)
  ],
  message: [Validators.maxLen(null, 255)]
}

// 提取文件
const extract = async() => {
  const res: ValidateResult = await extractFormRef.value.validate()
  if(!res.valid) {
    SfcUtils.snackbar('校验失败:' + res.errors.map(e => e.errorMessages).join(';'))
    return
  }

  const loading = SfcUtils.loadingDialog({msg: '正在获取分享信息'})
  try {
    const e = await SfcUtils.request(QuickShareApi.getByCode(extractCode.value))
    const share = e.data.data
    if (share.message) {
      SfcUtils.alert(share.message, '提取成功 - 留言')
        .then(() => SfcUtils.openApiUrl(QuickShareApi.getShareFile(share.id)))
    }
    
  } catch(err) {
    SfcUtils.alert('获取错误: ' + err)
    console.error(err)
  } finally {
    loading.close()
  }
}

// 执行发送文件
const sendFile = async() => {
  const res: ValidateResult = await sendFormRef.value.validate()
  if(!res.valid) {
    SfcUtils.snackbar('校验失败:' + res.errors.map(e => e.errorMessages).join(';'))
    return
  }
  
  const loadingParam = reactive({
    msg: '上传中'
  })
  const loading = SfcUtils.loadingDialog(loadingParam)
  const requestParam = QuickShareApi.upload(file.value[0], {
    code: sendCode.value,
    message: message.value,
  })
  requestParam.onUploadProgress = (e: Prog) => {
    loadingParam.msg = '上传中...' + ((e.loaded / e.total) * 100).toFixed(2) + '%'
  }
  try {
    const e = await SfcUtils.request(requestParam)
    const actualCode = e.data.data
    let msgs = ['发送成功，提取码为：' + actualCode]
    if (actualCode != sendCode.value) {
      msgs.push('(提取码冲突，系统随机新生成)')
    }

    const link = StringUtils.appendPath(location.origin, '/#/box/quick-share?code=' + actualCode)
    SfcUtils.openComponentDialog(h('div', null, [
      ...msgs.map(msg => h('div', null, msg)),
      h('div', null, [
        h('span', null, '提取链接：'),
        h('a', { class: 'link', onClick: () => { SfcUtils.copyToClipboard(link);SfcUtils.snackbar('复制成功')} }, link)
      ]),
      h('div', null, '或通过【百宝箱 - 文件极速传】功能中直接输入提取码提取')
    ]), {
      showCancel: false
    })
  } catch(err) {
    SfcUtils.alert('发送失败: ' + err)
    console.error(err)
  } finally {
    loading.close()
  }
}

// 使用url中传入的提取码参数
const useCodeParam = async() => {
  const params = context.routeInfo.value.curr?.query
  if (params && params.code) {
    extractCode.value = params.code as string
    await SfcUtils.sleep(100)
    await SfcUtils.confirm(`检测到链接中包含分享提取码${params.code}，是否立即提取？`, '提示')
    extract()
  }
}

onMounted(() => {
  useCodeParam()
})
</script>

<script lang="ts">
import { Components,Validators,ValidateResult, SfcUtils, context, StringUtils, StringFormatter } from 'sfc-common'
import { Prog } from 'sfc-common/utils/FileUtils/FileDataProcess'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, reactive, h, onMounted } from 'vue'
import QuickShareApi from '../api'

export default defineComponent({
  name: 'QuickShareView',
  components: { CommonIcon: Components.CommonIcon }
})
</script>

<style scoped lang="scss">
.qs-card-title {
  text-align: center;
}

.qs-card-spacer {
  position: absolute;
  right: 0;
  top: 0;
  width: 1px;
  height: 100%;
  background-color: rgba(var(--v-theme-primary), .3);
}
</style>