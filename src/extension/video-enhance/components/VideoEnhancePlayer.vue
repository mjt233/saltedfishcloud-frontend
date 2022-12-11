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
    type: Array as PropType<{no:string, url: string}[]>,
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
  
  const selectNo = ref('')
  if (props.videoInfo) {
    if (props.videoInfo.subtitleStreamList.length) {
      window.SfcUtils.snackbar(`检测到${props.videoInfo.subtitleStreamList.length}个字幕`)
      opt.contextmenu = [
        {
          text: '选择字幕',
          click() {
            window.SfcUtils.openComponentDialog(SubtitleSelector, {
              props: reactive({
                subtitles: props.videoInfo?.subtitleStreamList,
                'onUpdate:modelValue'(val: string) {
                  selectNo.value = val
                },
                modelValue: selectNo
              }),
              title: '选择字幕',
              contentMaxHeight: '360px',
              onConfirm() {
                const cur = dp.video.currentTime
                const urlObj = props.subtitleUrls.find(s => s.no == selectNo.value)
                if (!urlObj) {
                  window.SfcUtils.snackbar('找不到流编号为' + selectNo.value + '的字幕流')
                  return true
                }
                opt.subtitle = {
                  url: urlObj.url,
                  fontSize: '21px'
                }
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

    if (props.videoInfo.chapterList.length) {
      opt.highlight = props.videoInfo.chapterList.map(c => {
        return {
          text: c.title,
          time: Number(c.start) / 1000
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
import { DPlayerOptions } from 'dplayer'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, nextTick, watch, reactive } from 'vue'
import { VideoInfo } from '../model'
import SubtitleSelector from './SubtitleSelector.vue'

export default defineComponent({
  name: 'VideoEnhancePlayer'
})
</script>