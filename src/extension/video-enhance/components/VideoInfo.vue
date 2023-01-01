<template>
  <div>
    <div class="text-title">
      基本信息
    </div>
    <VTable>
      <tbody>
        <tr>
          <td style="min-width: 160px">
            封装格式
          </td>
          <td>{{ videoInfo.format.formatName }}</td>
        </tr>
        <tr>
          <td>封装格式全称</td>
          <td>{{ videoInfo.format.formatLongName }}</td>
        </tr>
        <tr>
          <td>码率</td>
          <td>{{ VEUtils.formatBitRate(videoInfo.format.bitRate) }}  ({{ videoInfo.format.bitRate }})</td>
        </tr>
        <tr>
          <td>持续时长</td>
          <td>{{ VEUtils.formatDuration(videoInfo.format.duration) }}</td>
        </tr>
        <tr v-if="videoInfo.format.tags">
          <td>其他标记</td>
          <td>
            <VTable v-if="showOtherTags">
              <thead>
                <tr>
                  <th>名称</th>
                  <th>值</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in Object.keys(videoInfo.format.tags)" :key="item">
                  <td>{{ item }}</td>
                  <td>{{ videoInfo.format.tags[item] }}</td>
                </tr>
              </tbody>
            </VTable>
            <a class="link" @click="showOtherTags = !showOtherTags">{{ showOtherTags ? '收起' : '展开' }}</a>
          </td>
        </tr>
      </tbody>
    </VTable>
    <div class="text-title">
      视频流
    </div>
    <VTable>
      <thead>
        <tr>
          <th>编码</th>
          <th>分辨率</th>
          <th>帧率</th>
          <th>语言</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="stream in videoStreams" :key="stream.index">
          <td>
            {{ stream.codecName }}
          </td>
          <td>{{ stream.width }}x{{ stream.height }}</td>
          <td>{{ (stream.avgFrameRate || 0).toFixed(3) }}</td>
          <td>{{ stream.language || '-' }}</td>
        </tr>
      </tbody>
    </VTable>
    <div class="text-title">
      音频流
    </div>
    <VTable>
      <thead>
        <tr>
          <th>编码</th>
          <th>采样</th>
          <th>码率</th>
          <th>声道</th>
          <th>语言</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="stream in audioStreams" :key="stream.index">
          <td>
            {{ stream.codecName }}
          </td>
          <td>{{ (stream.sampleRate as any as number)/1000 }}kHz</td>
          <td>{{ stream.bitRate/1000 }}K</td>
          <td>{{ stream.channels }}</td>
          <td>{{ stream.language || '-' }}</td>
        </tr>
      </tbody>
    </VTable>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  videoInfo: {
    type: Object as PropType<VideoInfo>,
    default: () => {return{}}
  },
  file: {
    type: Object as PropType<FileInfo>,
    default: undefined
  }
})

const showOtherTags = ref(false)
const videoStreams = computed(() => {
  return props.videoInfo.streams.filter(e => e.codecType == 'video')
})
const audioStreams = computed(() => {
  return props.videoInfo.streams.filter(e => e.codecType == 'audio')
})
</script>

<script lang="ts">
import { FileInfo } from '@/core/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, compile, computed } from 'vue'
import { VideoInfo } from '../model'
import { VEUtils } from '../utils/VEUtils'

export default defineComponent({
  name: 'VideoInfo'
})
</script>