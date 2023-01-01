<template>
  <div ref="rootRef">
    <h1>播放加载失败了QAQ</h1>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  url: {
    type: String,
    default: undefined
  },
  videoInfo: {
    type: Object as PropType<VideoInfo>,
    default: undefined
  },
  subtitleUrls: {
    type: Array as PropType<{index:string, url: string}[]>,
    default: () => []
  }
})
const rootRef = ref() as Ref<HTMLElement>
let dp:DPlayer

const initPlayer = () => {
  if (!props.url) {
    return
  }
  const opt:DPlayerOptions = {
    container: rootRef.value,
    video: {
      url: props.url
    }
  }
  
  const subtitle = ref() as Ref<StreamInfo>
  if (props.videoInfo) {
    const subtitleList = props.videoInfo.streams.filter(s => s.codecType == 'subtitle')
    if (subtitleList.length) {
      window.SfcUtils.snackbar(`检测到${subtitleList.length}个字幕`)
      opt.contextmenu = [
        {
          text: '选择字幕',
          click() {
            window.SfcUtils.openComponentDialog(SubtitleSelector, {
              props: reactive({
                subtitles: subtitleList,
                'onUpdate:modelValue'(val: StreamInfo) {
                  subtitle.value = val
                },
                modelValue: subtitle
              }),
              title: '选择字幕',
              contentMaxHeight: '360px',
              async onConfirm() {
                const cur = dp.video.currentTime
                const urlObj = props.subtitleUrls.find(s => s.index == subtitle.value.index)
                if (!urlObj) {
                  window.SfcUtils.snackbar('找不到流编号为' + subtitle.value + '的字幕流')
                  return true
                }
                opt.subtitle = {
                  url: urlObj.url,
                  fontSize: '21px'
                };
                (opt.contextmenu as DPlayerContextMenuItem[])[0].text = '字幕：' + subtitle.value.language + (subtitle.value.title ? ('(' + subtitle.value.title + ')') : '')
                console.log(opt.contextmenu)
                dp.destroy()
                dp = new window.DPlayer(opt)
                dp.play()
                dp.seek(cur)
                return true
              }
            })
          }
        }
      ]
    }

    if (props.videoInfo.chapters.length) {
      opt.highlight = props.videoInfo.chapters.map(c => {
        return {
          text: c.title,
          time: Number(c.startTime)
        }
      })
    }
  }
  dp = new window.DPlayer(opt)
  dp.play()
}

onMounted(async() => {
  await nextTick()
  initPlayer()
})

watch(() => props.url, initPlayer)
</script>

<script lang="ts">
import type DPlayer from 'dplayer'
import { DPlayerContextMenuItem, DPlayerOptions } from 'dplayer'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, nextTick, watch, reactive } from 'vue'
import { StreamInfo, VideoInfo } from '../model'
import SubtitleSelector from './SubtitleSelector.vue'

export default defineComponent({
  name: 'VideoEnhancePlayer'
})
</script>