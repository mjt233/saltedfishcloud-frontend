<template>
  <div ref="rootRef" class="player-root">
    <div ref="playerRef" class="player">
      <h1>播放加载失败了QAQ</h1>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import ASS from 'assjs'
const SfcUtils = window.SfcUtils
const props = defineProps({
  url: {
    type: String,
    default: undefined
  },
  videoInfo: {
    type: Object as PropType<VideoInfo>,
    default: undefined
  },
  subtitleList: {
    type: Array as PropType<Subtitle[]>,
    default: () => []
  }
})
const rootRef = ref() as Ref<HTMLElement>
const playerRef = ref() as Ref<HTMLElement>

let dp:DPlayer
// ass字幕实例
let assInst: any
let fontSizeResizer: any


const reloadPlayer = async(playerOpt: DPlayerOptions) => {
  const cur = dp.video.currentTime
  dp.destroy()
  dp = new window.DPlayer(playerOpt)
  dp.play()
  dp.seek(cur)
}

const assHandler = MethodInterceptor.createThrottleProxy({
  autoResizeAss() {
    if (assInst) {
      assInst.resize()
    }
  }
}, {
  afterExecute: true,
  delay: 500
})


function cancelFontSizeResizer() {
  if (fontSizeResizer) {
    clearInterval(fontSizeResizer)
    fontSizeResizer = null
  }
}

/**
 * 播放ass字幕
 * @param text ass字幕文本
 */
function playerAssSubtitle(text: string) {
  if (assInst) {
    assInst.destroy()
    assInst = null
  }
  const assDiv = document.createElement('div')
  assDiv.classList.add('subtitle')
  const cssScopeFlag = playerRef.value.getAttributeNames().find(e => e.startsWith('data-v-')) as string
  assDiv.setAttribute(cssScopeFlag, '')
  playerRef.value.appendChild(assDiv)
  assInst = new ASS(text, dp.video, {
    container: assDiv,
    resampling: 'video_width'
  })
  cancelFontSizeResizer()

  const forceFontSize = '21px'
  const stage = playerRef.value.querySelector('.ASS-stage')
  if (stage) {
    if(stage.getAttribute('has-hock-append-child') != '1') {
      stage.setAttribute('has-hock-append-child', '1')
      // 对每个新添加的字幕强制重置字体大小
      const originAppendChild = stage.appendChild.bind(stage)
      stage.appendChild = dom => {
        if (dom instanceof HTMLElement) {
          const textDom = dom.querySelector('span')
          if (textDom) {
            textDom.style.fontSize = forceFontSize
          }
        }
        return originAppendChild(dom)
      }
    }
  }
  fontSizeResizer = setInterval(() => {
    playerRef.value.querySelectorAll('.ASS-stage span').forEach(textDom => (textDom as HTMLSpanElement).style.fontSize = forceFontSize)
  }, 500)
}

const initPlayer = () => {
  if (!props.url) {
    return
  }
  const opt:DPlayerOptions = {
    container: playerRef.value,
    video: {
      url: props.url
    }
  }
  
  const subtitle = ref() as Ref<Subtitle>
  if (props.videoInfo) {
    if (props.subtitleList.length) {
      window.SfcUtils.snackbar(`检测到${props.subtitleList.length}个字幕`)
      opt.contextmenu = [{
        text: '选择字幕',
        click() {
          window.SfcUtils.openComponentDialog(SubtitleSelector, {
            props: reactive({
              subtitleList: props.subtitleList,
              'onUpdate:modelValue'(val: Subtitle) {
                subtitle.value = val
              },
              modelValue: subtitle
            }),
            title: '选择字幕',
            contentMaxHeight: '360px',
            async onConfirm() {
              if (subtitle.value.type == 'webvtt') {
                opt.subtitle = {
                  url: subtitle.value.url,
                  fontSize: '21px'
                };
                (opt.contextmenu as DPlayerContextMenuItem[])[0].text = '字幕：' + subtitle.value.title
                reloadPlayer(opt)
                cancelFontSizeResizer()
              } else {
                opt.subtitle = undefined;
                (opt.contextmenu as DPlayerContextMenuItem[])[0].text = '字幕：' + subtitle.value.title
                reloadPlayer(opt)
                const assText = (await SfcUtils.request({url: subtitle.value.url})).data as string
                playerAssSubtitle(assText)
              }
              return true
            }
          })
        }
      }]
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
  window.addEventListener('resize', assHandler.autoResizeAss)
})
onUnmounted(() => {
  window.removeEventListener('resize', assHandler.autoResizeAss)
  cancelFontSizeResizer()
})

watch(() => props.url, initPlayer)
</script>

<script lang="ts">
import type DPlayer from 'dplayer'
import { DPlayerContextMenuItem, DPlayerOptions } from 'dplayer'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, nextTick, watch, reactive, onUnmounted } from 'vue'
import { StreamInfo, Subtitle, VideoInfo } from '../model'
import SubtitleSelector from './SubtitleSelector.vue'
import { MethodInterceptor } from 'sfc-common'

export default defineComponent({
  name: 'VideoEnhancePlayer'
})
</script>

<style scoped lang="scss">
.player-root {
  position: relative;
  .subtitle {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 1000;
  }
}
</style>