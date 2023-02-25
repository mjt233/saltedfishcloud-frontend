<template>
  <base-form
    ref="formRef"
    :model-value="formData"
    :submit-action="actions.submit"
  >
    <LoadingMask :loading="loadingRef" />
    <div class="text-h6">
      视频
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
          <td>
            <FormSelect
              v-if="encoderOptions.video.length"
              v-model="formData.convertRules[stream.index].encoder"
              :disabled="!formData.mapStreams[stream.index]"
              style="width: 160px"
              :items="encoderOptions.video"
              @change="updateEnabledRules"
            />
          </td>
        </tr>
      </tbody>
    </VTable>
    <div class="text-h6">
      音频
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
          <td>
            <FormSelect
              v-if="encoderOptions.audio.length"
              v-model="formData.convertRules[stream.index].encoder"
              :disabled="!formData.mapStreams[stream.index]"
              style="width: 160px"
              :items="encoderOptions.audio"
              @change="updateEnabledRules"
            />
          </td>
        </tr>
      </tbody>
    </VTable>
  </base-form>
</template>

<script setup lang="ts">
import { SelectOption } from 'sfc-common/model'
import { CommonForm } from 'sfc-common/utils/FormUtils'
const formRef = ref() as Ref<CommonForm>
const props = defineProps({
  videoInfo: {
    type: Object as PropType<VideoInfo>,
    default: () => { return {} }
  }
})
const ffmpegInfo = ref<FFMpegInfo>()
const emits = defineEmits(['submit'])

const copyEncoder: SelectOption = {
  title: '复制',
  value: 'copy'
}
const formInst = window.FormUtils.defineForm({
  actions: {
    async submit() {
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
      updateEnabledRules()
    },
    /**
     * 加载ffmpeg编码器信息
     */
    async loadFFMpegInfo() {
      loadingManager.beginLoading()
      try {
        const res = (await window.SfcUtils.request(VEAPI.getFFMpegInfo())).data.data
        ffmpegInfo.value = res
        encoderOptions.video = [copyEncoder].concat(res.videoEncoders.filter(e => e.name.includes('264') || e.name.includes('265') || e.name.includes('hevc')).map(e => {
          return {
            title: e.name,
            value: e.name
          }
        }))
        encoderOptions.audio = [copyEncoder].concat(res.audioEncoders.filter(e => e.name.includes('aac')).map(e => {
          return {
            title: e.name,
            value: e.name
          }
        }))
        encoderOptions.subtitle = [copyEncoder].concat(res.subtitleEncoders.map(e => {
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
    convertRules: {} as { [index:string]: EncodeConvertRule},
    mapStreams: {} as { [index:string]: boolean },
    enabledConvertRules: [] as EncodeConvertRule[]
  },
  formRef: formRef,
  validators: {},
  throwError: true
})
const { formData, actions, validators, loadingRef, loadingManager  } = formInst

const updateEnabledRules = () => {
  formData.enabledConvertRules = props.videoInfo.streams
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

// 初始化默认规则
props.videoInfo.streams.forEach(e => {
  formData.convertRules[e.index] = {
    index: e.index,
    encoder: 'copy',
    method: 'copy',
    type: e.codecType
  }
  formData.mapStreams[e.index] = true
})
updateEnabledRules()
onMounted(async() => {
  await actions.loadFFMpegInfo()
})

const videoStreams = computed(() => {
  return props.videoInfo.streams.filter(e => e.codecType == 'video')
})
const audioStreams = computed(() => {
  return props.videoInfo.streams.filter(e => e.codecType == 'audio')
})
const subtitleStreams = computed(() => {
  return props.videoInfo.streams.filter(e => e.codecType == 'subtitle')
})

const encoderOptions = reactive({
  video: [] as SelectOption[],
  audio: [] as SelectOption[],
  subtitle: [] as SelectOption[]
})
defineExpose(formInst)
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed, onMounted, provide, reactive } from 'vue'
import { VEAPI } from '../api'
import { EncodeConvertRule, FFMpegInfo, VideoInfo } from '../model'

export default defineComponent({
  name: 'VideoConvertForm'
})
</script>