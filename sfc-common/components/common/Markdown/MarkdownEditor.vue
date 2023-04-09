<template>
  <ResizeContainer>
    <div style="height: 100%;">
      <div v-if="!readOnly" class="tool-bar">
        <div v-ripple @click="openConfig">
          <VIcon icon="mdi-cog" />
        </div>
        
      </div>
      <CodeEditor
        ref="editor"
        type="markdown"
        :model-value="modelValue"
        v-bind="$attrs"
        language="markdown"
        :read-only="readOnly"
        :style="{height: `calc(100% - ${readOnly ? '0px' : '32px'})`}"
        @update:model-value="modelValueChange"
        @patse-image="patseImage"
      />
    </div>
    <template #resizeable>
      <MarkdownView :content="curMarkdownText" :resource-params="resourceParams" />
    </template>
  </ResizeContainer>
</template>

<script setup lang="ts">
const editor = ref() as Ref<CodeEditorModel>
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  readOnly: {
    type: Boolean,
    default: true
  },
  resourceParams: {
    type: Object as PropType<ResourceRequest>,
    default: undefined
  }
})
const emits = defineEmits(['update:modelValue'])
const curMarkdownText = ref('')

const updateMarkdownText = MethodInterceptor.createThrottleProxy(
  MethodInterceptor.wrapFun((value: string) => { curMarkdownText.value = value}),
  { afterExecute: true }
)

watch(() => props.modelValue, () => {
  updateMarkdownText.invoke(props.modelValue)
})
onMounted(() => {
  curMarkdownText.value = props.modelValue
})

const modelValueChange = (value: string) => {
  emits('update:modelValue', value)
  updateMarkdownText.invoke(value)
}

/**
 * 打开设置表单
 */
const openConfig = () => {
  const dialog = SfcUtils.openComponentDialog(MarkdownImagePatseFormVue, {
    title: 'Markdown编辑配置',
    async onConfirm() {
      const form = dialog.getInstAsForm()
      const res = await form.submit()
      if(res.success) {
        return true
      }
      SfcUtils.snackbar(res.err)
      return false
    }
  })
}

/**
 * 获取默认文件名
 */
const getFileDefaultName = (file: File) => {
  const now = new Date()
  return (StringFormatter.toDate(now) + '-' + now.getSeconds() + '.' + file.type.replace(/^.*\//, ''))
    .replaceAll(':', '-')
    .replaceAll(' ', '_')
}

/**
 * 获取文件粘贴选项，优先从localStorage中读取，若读取到且设置了无需确认则直接返回，否则打开对话框让用户选择，用户确认后返回
 * @param file 待粘贴的图片文件
 */
const getImagePatseOption = async(file: File) => {
  // 优先从localStorage中读取
  const json = localStorage.getItem(CONFIG_KEY)
  if (!json) {
    return await openPatseOptionForm(file)
  }
  try {
    const option = JSON.parse(json) as ImagePatseOption
    if (!option.alwayConfirm) {
      // 若读取到且设置了无需确认则直接返回
      option.name = getFileDefaultName(file)
      return option
    } else {
      // 否则打开对话框让用户选择，用户确认后返回
      return await openPatseOptionForm(file)
    }
  } catch (err) {
    localStorage.removeItem(CONFIG_KEY)
    return await openPatseOptionForm(file)
  }
}

/**
 * 打开对话框让用户确认图片粘贴选项
 * @param file 待粘贴的图片文件
 */
const openPatseOptionForm = (file: File):Promise<ImagePatseOption> => {
  return new Promise((resolve, reject) => {
    const dialog = SfcUtils.openComponentDialog(MarkdownImagePatseConfirmForm, {
      title: '粘贴图片',
      props: {
        fileName: getFileDefaultName(file)
      },
      onConfirm() {
        const option = dialog.getInstAsForm().getFormData() as ImagePatseOption
        dialog.getInstAsForm().submit()
        resolve(option)
        return true
      }
    })
  })
}

/**
 * 粘贴图片
 * @param file 待粘贴图片
 */
const patseImage = async(file: File) => {
  if (props.readOnly) {
    return
  }
  if (!props.resourceParams) {
    SfcUtils.alert('未配置图片上传参数')
    return
  }
  // 获取粘贴配置
  const option = await getImagePatseOption(file)

  // 构造上传API参数
  const params = {...props.resourceParams} as ResourceRequest
  params.name = option.name
  if (option.location == '1') {
    params.path = StringUtils.appendPath(params.path, option.path.replace(/^\.\/+/, ''))
  } else {
    params.path = option.path
    params.targetId = context.session.value.user.id
  }
  const conf = API.resource.uploadCommonResource(params, file)
  
  // 打开上传进度对话框
  const loadingParam = reactive({msg: '正在上传...'})
  const loadingDialog = SfcUtils.loadingDialog(loadingParam)
  conf.onUploadProgress = (e: Prog) => {
    loadingParam.msg = '正在上传...' + ((e.loaded/e.total)*100).toFixed(1) + '%'
  }

  try {
    // 开始上传
    await SfcUtils.request(conf)
    loadingParam.msg = '正在加载文件信息...'
    let imgUrl

    // 获取上传后的文件url，对于“当前位置”直接用原路径即可
    // 在私人网盘指定路径的则需要获取文件的md5，使用按文件md5获取文件的接口url
    if (option.location == '1') {
      imgUrl = StringUtils.appendPath(option.path, option.name)
    } else {
      const res = await SfcUtils.request(API.file.getFileInfo(context.session.value.user.id, option.path, option.name))
      const fileInfo = res.data.data
      if (!fileInfo) {
        SfcUtils.alert('上传的文件信息获取失败')
        return
      } else if (!fileInfo.md5) {
        SfcUtils.alert('暂不支持从挂载路径获取文件url')
        return
      }
      imgUrl = StringUtils.appendPath('/', SfcUtils.axios.defaults.baseURL || '', API.resource.downloadFileByMD5(fileInfo.md5, option.name).url)
    }
    editor.value.insertText(`![${option.name}](${imgUrl})`)
    SfcUtils.snackbar('图片粘贴成功')
    loadingDialog.close()
  } catch(err) {
    loadingDialog.close()
    SfcUtils.alert(err ? err.toString() : err + '', '上传错误')
  }
  
}


</script>

<script lang="ts">
import { CodeEditorModel } from 'sfc-common/model/component/CodeEditorModel'
import { MethodInterceptor } from 'sfc-common/utils/MethodInterceptor'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import MarkdownImagePatseFormVue from './MarkdownImagePatseForm.vue'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, watch, reactive } from 'vue'
import MarkdownImagePatseConfirmForm from './MarkdownImagePatseConfirmForm.vue'
import { ImagePatseOption } from './type'
import { StringFormatter, StringUtils } from 'sfc-common/utils'
import { CONFIG_KEY } from './constants'
import { API, CommonRequest, context, ResourceRequest } from 'sfc-common/index'
import { Prog } from 'sfc-common/utils/FileUtils/FileDataProcess'

export default defineComponent({
  name: 'MarkdownEditor'
})
</script>


<style lang="scss" scoped>
.tool-bar {
  height: 32px;

  &>* {
    display: inline-block;
    cursor: pointer;
    padding: 3px;
  }
}
</style>