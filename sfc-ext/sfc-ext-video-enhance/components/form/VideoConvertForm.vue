<template>
  <base-form
    ref="formRef"
    :model-value="formData"
    :submit-action="actions.submit"
  >
    <LoadingMask :loading="loadingRef" />
    <!-- <div v-if="!isMultipleFiles" class="text-h6 mb-4">
      基本参数
    </div> -->
    <FormRow v-if="!isMultipleFiles">
      <FormCol>
        <TextInput v-model="formData.fileName" label="新文件名" :rules="validators.fileName" />
      </FormCol>
    </FormRow>
    <FormRow>
      <FormCol>
        <VSelect
          v-model="formData.format"
          :rules="validators.format"
          label="目标封装格式"
          color="primary"
          variant="underlined"
          :items="formatOptions"
        />
      </FormCol>
    </FormRow>
    <FormRow v-if="!isMultipleFiles">
      <FormCol label="文件保存位置">
        <span class="tip mr-1 link">{{ formData.savePath }}</span>
        <VBtn flat @click="selectPath">
          浏览
        </VBtn>
      </FormCol>
    </FormRow>
    <FormRow v-if="isMultipleFiles">
      <FormCol>
        <VSelect
          :model-value="formData.pathStrategy"
          label="文件输出路径策略"
          color="primary"
          variant="underlined"
          :items="[
            { title: '输出到原目录', value: 'same'},
            { title: '输出到相对原目录', value: 'relative'},
            { title: '输出到固定目录', value: 'fixed'}
          ]"
          @update:model-value="formData.pathStrategy = $event; formData.savePath = {'same': '', 'fixed': '/', 'relative': '转码'}[$event]"
        />
      </FormCol>
      <FormCol v-if="formData.pathStrategy != 'same'" :label="formData.pathStrategy == 'fixed' ? '保存路径' : ''">
        <VTooltip v-if="formData.pathStrategy == 'relative'" location="bottom">
          <template #activator="{ props: p }">
            <TextInput v-bind="p" v-model="formData.savePath" label="相对原目录的路径" />
          </template>
          效果预览：
          <ul class="pl-4">
            <li>原文件: /我的视频/电影/流浪地球.mkv</li>
            <li>输出位置: {{ VEUtils.resolveRelativePath('/我的视频/电影', `${formData.savePath}/流浪地球.${VEUtils.getFormatExtName(formData.format)}`) }}</li>
          </ul>
        </VTooltip>
        
        <template v-else>
          <span class="tip mr-1 link">{{ formData.savePath }}</span>
          <VBtn flat @click="selectPath">
            浏览
          </VBtn>
        </template>
      </FormCol>
    </FormRow>
    <FormRow>
      <FormCol>
        <span class="text">杂项</span>
        <div class="d-flex align-center">
          <VCheckbox
            v-model="formData.isOverwrite"
            label="存在同名文件时，覆盖保存"
            color="primary"
            hide-details
          />
          <VTooltip text="若不勾选该选项，存在同名文件时自动给新文件加上任务id数字前缀">
            <template #activator="{ props: p }">
              <CommonIcon
                icon="mdi-help-circle"
                v-bind="p"
                size="16"
                class="mb-2 ml-2"
              />
            </template>
          </VTooltip>
        </div>
        
        <VCheckbox
          v-model="showCommonEncoders"
          label="只显示常用编码器"
          color="primary"
          hide-details
        />
      </FormCol>
    </FormRow>
    <VDivider class="mt-1 mb-1" />
    <div class="text-h6">
      视频流
    </div>
    <VTable>
      <thead>
        <tr>
          <th style="width: 64px">
            选择
          </th>
          <th>原编码</th>
          <th>语言</th>
          <th>编码器</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="stream in videoStreams" :key="stream.index">
          <td>
            <VCheckbox
              v-model="formData.mapStreams[stream.index]"
              color="primary"
              style="margin-top:6px"
              density="comfortable"
              hide-details
            />
          </td>
          <td>{{ stream.codecName }}</td>
          <td>{{ stream.language || '-' }}</td>
          <td width="260px">
            <FormSelect
              v-if="encoderOptions.video.length"
              v-model="formData.convertRules[stream.index].encoder"
              :disabled="!formData.mapStreams[stream.index]"
              :items="encoderOptions.video"
              style="transform: translateY(-5px);"
              @change="updateEnabledRules"
            />
          </td>
        </tr>
      </tbody>
    </VTable>
    <div class="text-h6">
      音频流
    </div>
    <VTable>
      <thead>
        <tr>
          <th style="width: 64px">
            选择
          </th>
          <th>原编码</th>
          <th>语言</th>
          <th>编码器</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="stream in audioStreams" :key="stream.index">
          <td>
            <VCheckbox
              v-model="formData.mapStreams[stream.index]"
              color="primary"
              style="margin-top:6px"
              density="comfortable"
              hide-details
            />
          </td>
          <td>{{ stream.codecName }}</td>
          <td>{{ stream.language || '-' }}</td>
          <td width="260px">
            <FormSelect
              v-if="encoderOptions.audio.length"
              v-model="formData.convertRules[stream.index].encoder"
              :disabled="!formData.mapStreams[stream.index]"
              :items="encoderOptions.audio"
              style="transform: translateY(-5px);"
              @change="updateEnabledRules"
            />
          </td>
        </tr>
      </tbody>
    </VTable>
    <!-- <div class="text-h6">
      字幕
    </div>
    <span class="link" @click="showSubtitleOption = !showSubtitleOption">{{ showSubtitleOption ? '收起字幕选项' : '展开字幕选项' }}</span>
    
    <VDivider /> -->
    
    <div class="text-h6 mb-6">
      高级参数
    </div>
    <FormRow>
      <FormCol>
        <VTooltip text="crf画质质量因子，通常为18~23，该值越大画质越差，文件越小。" location="top">
          <template #activator="{ props: p }">
            <TextInput
              v-bind="p"
              v-model="formData.crf"
              :rules="validators.crf"
              label="crf"
            />
          </template>
        </VTooltip>
      </FormCol>
      <FormCol>
        <div class="d-flex align-end">
          <FormSelect
            v-model="formData.preset"
            label="编码质量预设(preset)"
            :items="[
              { title: 'ultrafast', value: 'ultrafast'},
              { title: 'superfast', value: 'superfast'},
              { title: 'veryfast', value: 'veryfast'},
              { title: 'faster', value: 'faster'},
              { title: 'fast', value: 'fast'},
              { title: 'medium', value: 'medium'},
              { title: 'slow', value: 'slow'},
              { title: 'slower', value: 'slower'},
              { title: 'veryslow', value: 'veryslow'},
              { title: 'placebo', value: 'placebo'}
            ]"
          />
          <VTooltip location="bottom" interactive>
            视频编码的质量与速度预设，在编码速度和质量上做取舍，越慢的预设同画质下文件越小。可选值从快到慢依次为：
            <ul class="ml-6">
              <li><b>ultrafast</b> - 极速编码，压缩效率最低，输出文件最大，适用于实时流或测试</li>
              <li><b>superfast</b> - 超快速编码，适合需要快速转换的场景</li>
              <li><b>veryfast</b> - 非常快速，速度与质量的较好平衡，适合屏幕录制</li>
              <li><b>faster</b> - 较快编码，比veryfast稍慢但质量更好</li>
              <li><b>fast</b> - 快速编码，默认预设值，适合一般用途</li>
              <li><b>medium</b> - 中等速度，速度与质量的最佳平衡，<b>推荐作为通用选择</b></li>
              <li><b>slow</b> - 慢速编码，较高压缩效率，文件比medium小5-10%，适合高质量存储</li>
              <li><b>slower</b> - 更慢编码，压缩效率更高，编码时间显著增加</li>
              <li><b>veryslow</b> - 非常慢编码，最高压缩效率，输出文件最小，适合长期存档</li>
              <li><b>placebo</b> - 安慰剂模式，极慢编码，相比veryslow只有微小提升，通常不建议使用</li>
            </ul>

            <p>
              <b>预设选择原则：</b>预设值越慢，在相同视频质量下输出的文件越小，但编码所需时间越长。
              对于H.264/H.265编码器，veryslow相比ultrafast通常可节省30-50%的文件大小。
            </p>
            <p>
              <b>注意：</b>此参数仅适用于软件编码器（如libx264、libx265），
              硬件编码器可能有不同的预设选项。
            </p>
            <template #activator="{ props: p }">
              <CommonIcon
                icon="mdi-help-circle"
                v-bind="p"
                size="16"
                class="mb-2 ml-2"
              />
            </template>
          </VTooltip>
        </div>
      </FormCol>
      <FormCol>
        <div class="d-flex align-end">
          <VTooltip text="视频编码优化调优参数。针对特定类型的视频内容进行编码优化，以获得更好的压缩效率或视觉质量。" location="bottom">
            <template #activator="{props: p}">
              <VCombobox
                v-bind="p"
                v-model="formData.tune"
                :return-object="false"
                color="primary"
                variant="underlined"
                clearable
                hide-details
                label="特定优化参数(tune)"
                :items="[
                  { title: '日本动画/卡通', value: 'animation'},
                  { title: '真人电影/电视剧', value: 'film'},
                  { title: '老电影（有颗粒感）', value: 'grain'},
                  { title: 'PPT演示/', value: 'stillimage'},
                  { title: '视频会议/直播', value: 'zerolatency'},
                  { title: '低性能设备播放', value: 'fastdecode'}
                ]"
              />
            </template>
          </VTooltip>
        </div>
      </FormCol>
      <FormCol />
    </FormRow>
  </base-form>
</template>

<script setup lang="ts">
import { FileInfo, SelectOption } from 'sfc-common/model'
import { CommonForm } from 'sfc-common/utils/FormUtils'
const formRef = ref() as Ref<CommonForm>
const props = defineProps({
  /**
   * 单文件模式下，当前视频文件的详细信息
   */
  videoInfo: {
    type: Object as PropType<VideoInfo | undefined>,
    default: undefined
  },
  /**
   * 当前选中的视频文件信息，当选择多个文件时，则表示批量转码
   */
  fileInfo: {
    type: Object as PropType<FileInfo | FileInfo[]>,
    required: true
  },
  /**
   * 选中路径时，指定用户的资源路径
   */
  uid: {
    type: [String, Number],
    required: true
  }
})
const ffmpegInfo = ref<FFMpegInfo>()
const emits = defineEmits(['submit'])
// 目标格式选项列表
const formatOptions = reactive([
  { title: 'mp4', value: VEUtils.getExtNameMuxer('mp4') },
  { title: 'mkv', value: VEUtils.getExtNameMuxer('mkv') },
  { title: 'mov', value: VEUtils.getExtNameMuxer('mov') },
  { title: 'flv', value: VEUtils.getExtNameMuxer('flv') },
  { title: 'wmv', value: VEUtils.getExtNameMuxer('wmv') },
  { title: 'avi', value: VEUtils.getExtNameMuxer('avi') }
])

const showSubtitleOption = ref(false)
// 筛选显示常用编码器
const showCommonEncoders = ref(true)
const commonEncodersKeyWord = {
  video: [ '264', '265', 'hevc' ],
  audio: [ 'aac' ]
}
// 是否为多文件模式（fileInfo包含文件夹 或 存在多个文件）
const isMultipleFiles = computed(() => {
  if (Array.isArray(props.fileInfo)) {
    return props.fileInfo.length > 1 || props.fileInfo.some(f => f.dir)
  } else if (props.fileInfo) {
    return props.fileInfo.dir
  } else {
    return false
  }
})
const videoInfoReference: VideoInfo = props.videoInfo || {
  chapters: [],
  format: {
    bitRate: '0',
    duration: 0,
    formatLongName: '',
    formatName: 'mkv',
    nbPrograms: '0',
    nbStreams: '0',
    size: '0',
    tags: {}
  },
  streams: [
    {
      index: '0',
      codecLongName: '',
      codecName: '-',
      codecType: 'video',
      duration: 0
    },
    {
      index: '1',
      codecLongName: '',
      codecName: '-',
      codecType: 'audio',
      duration: 0
    },
  ]
}

watch(showCommonEncoders, () => formInst.actions.loadFFMpegInfo() )

const copyEncoder: SelectOption = {
  title: '复制',
  value: 'copy'
}
const formInst = window.FormUtils.defineForm({
  actions: {
    async submit() {
      if (!isMultipleFiles.value && props.videoInfo) {
        const rule = props.videoInfo.streams.find(e => (e.codecType == 'audio' || e.codecType == 'video') && formData.mapStreams[e.index])
        if (!rule) {
          throw new Error('至少选择一个音频或视频流')
        }
      
        if(!props.videoInfo.streams.find(e => e.codecType == 'video' && formData.mapStreams[e.index])) {
          await window.SfcUtils.confirm('没有选择视频流，确定？', '提示', {
            cancelToReject: true
          })
        }

        if(!props.videoInfo.streams.find(e => e.codecType == 'audio' && formData.mapStreams[e.index])) {
          await window.SfcUtils.confirm('没有选择音频流，确定？', '提示', {
            cancelToReject: true
          })
        }
      }
      updateEnabledRules()
    },
    /**
     * 加载ffmpeg编码器信息
     */
    async loadFFMpegInfo() {
      loadingManager.beginLoading()
      try {
        if (ffmpegInfo.value == null) {
          const res = (await window.SfcUtils.request(VEAPI.getFFMpegInfo())).data.data
          ffmpegInfo.value = res
        }
        const info = ffmpegInfo.value
        encoderOptions.video = [copyEncoder].concat(info.videoEncoders.filter(e => {
          if (showCommonEncoders.value) {
            return commonEncodersKeyWord.video.some(keyword => e.name.includes(keyword))
          } else {
            return true
          }
        }).map(e => {
          return {
            title: e.name,
            value: e.name
          }
        }))
        encoderOptions.audio = [copyEncoder].concat(info.audioEncoders.filter(e => {
          if (showCommonEncoders.value) {
            return commonEncodersKeyWord.audio.some(keyword => e.name.includes(keyword))
          } else {
            return true
          }
        }).map(e => {
          return {
            title: e.name,
            value: e.name
          }
        }))
        encoderOptions.subtitle = [copyEncoder].concat(info.subtitleEncoders.map(e => {
          return {
            title: e.name,
            value: e.name
          }
        }))
      } catch (err) {
        window.SfcUtils.snackbar(err)
      } finally {
        loadingManager.closeLoading()
      }
    }
  },
  formData: {
    convertRules: {},
    mapStreams: {},
    enabledConvertRules: [],
    crf: '18',
    format: '',
    fileName: '',
    savePath: '/',
    preset: 'medium',
    isOverwrite: false,
    pathStrategy: 'same'
  } as EncodeConvertFormData,
  formRef: formRef,
  validators: {
    fileName: [Validators.notNull('请输入文件名')],
    crf: [
      Validators.notNull('请输入crf'),
      Validators.isNum('crf必须是数字'),
      Validators.isNonNegativeNum('crf不能是负数'),
      Validators.minNum(1)
    ],
    format: [Validators.notNull('请输入封装格式')],
  },
  throwError: true
})
const { formData, actions, validators, loadingRef, loadingManager  } = formInst

watch(() => formData.format, () => {
  const opt = formatOptions.find(e => e.value == formData.format)
  if (opt) {
    const newName = formData.fileName.replace(/\.\w+$/, `.${opt.title}`)
    formData.fileName = newName
  }
})

const updateEnabledRules = () => {
  formData.enabledConvertRules = videoInfoReference.streams
    .filter(e => formData.mapStreams[e.index])
    .map(e => formData.convertRules[e.index])
  formData.enabledConvertRules.forEach(e => {
    if (e.encoder != 'copy') {
      e.method = 'convert'
    } else {
      e.method = 'copy'
    }
  })
}

async function selectPath() {
  try {
    formData.savePath = await window.SfcUtils.selectPath({
      filter: file => file.dir,
      path: formData.savePath,
      uid: props.uid
    })
  } catch (e) {
    if (e != 'cancel') {
      window.SfcUtils.snackbar(e)
    }
  }
}

onMounted(async() => {
  updateEnabledRules()
  initFormData()
  await actions.loadFFMpegInfo()
})



// 初始化默认规则
function initFormData() {
  if (!isMultipleFiles.value && props.videoInfo) {
    props.videoInfo.streams.forEach(e => {
      formData.convertRules[e.index] = {
        index: e.index,
        encoder: 'copy',
        method: 'copy',
        type: e.codecType
      }
      formData.mapStreams[e.index] = true
    })
    const fileInfo = Array.isArray(props.fileInfo) ? props.fileInfo[0] : props.fileInfo as FileInfo
    const formatNames = props.videoInfo.format.formatName.split(',')
    formData.fileName = fileInfo.name || ''
    formData.format = formatNames[0]
    formData.savePath = fileInfo.path || '/'
  } else {
    formData.convertRules = {
      '0': {
        type: 'video',
        encoder: 'copy',
        index: '0',
        method: 'copy'
      },
      '1': {
        type: 'audio',
        encoder: 'copy',
        index: '1',
        method: 'copy'
      }
    }
    formData.mapStreams = {
      '0': true,
      '1': true
    }
    // formData.format = VEUtils.getExtNameMuxer('mkv')
  }

  

  if (isMultipleFiles.value) {
    formatOptions.unshift({
      title: '保留原格式',
      value: 'keep'
    })
    formData.format = 'keep'
  }
}

const videoStreams = computed(() => {
  return videoInfoReference.streams.filter(e => e.codecType == 'video')
})
const audioStreams = computed(() => {
  return videoInfoReference.streams.filter(e => e.codecType == 'audio')
})
const subtitleStreams = computed(() => {
  return videoInfoReference.streams.filter(e => e.codecType == 'subtitle')
})

const encoderOptions = reactive({
  video: [] as SelectOption[],
  audio: [] as SelectOption[],
  subtitle: [] as SelectOption[]
})
defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed, onMounted, provide, reactive, watch } from 'vue'
import { VEAPI } from '../../api'
import { EncodeConvertFormData, EncodeConvertRule, FFMpegInfo, StreamInfo, VideoInfo } from '../../model'
import { StringUtils, Validators } from 'sfc-common'
import { VEUtils } from '../../core/VEUtils'

export default defineComponent({
  name: 'VideoConvertForm'
})
</script>