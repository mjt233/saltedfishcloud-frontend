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
  },
  file: {
    type: Object as PropType<FileInfo>,
    default: undefined
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
  initPlayerListener(dp)
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

async function initPlayerOptSubtitle(opt: DPlayerOptions, subtitle: Subtitle) {
  if (subtitle.type == 'webvtt') {
    opt.subtitle = {
      url: subtitle.url,
      fontSize: '21px'
    };
    (opt.contextmenu as DPlayerContextMenuItem[])[0].text = '字幕：' + subtitle.title
    cancelFontSizeResizer()
  } else if (subtitle.type == 'ass') {
    opt.subtitle = undefined;
    (opt.contextmenu as DPlayerContextMenuItem[])[0].text = '字幕：' + subtitle.title
    const assText = (await SfcUtils.request({url: subtitle.url})).data as string
    playerAssSubtitle(assText)
  } else {
    opt.subtitle = undefined
    window.SfcUtils.alert(`不支持的字幕类型:${subtitle.type}`)
  }
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
              initPlayerOptSubtitle(opt, subtitle.value)
              reloadPlayer(opt)
              return true
            }
          })
        }
      }]
      const defaultSubtitle = props.subtitleList.find(e => e.isDefault && VEUtils.isSupportSubtitleType(e.type))
      if (defaultSubtitle) {
        initPlayerOptSubtitle(opt, defaultSubtitle)
        subtitle.value = defaultSubtitle
        window.SfcUtils.snackbar(`自动加载默认字幕${defaultSubtitle.title}`)
      } else {
        window.SfcUtils.snackbar(`检测到${props.subtitleList.length}个字幕`)
      }
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
  initPlayerListener(dp)
  dp.play()
  dp.video.addEventListener('loadeddata', async() => {
    const lastProgress = await getLastProgress()
    if (lastProgress) {
      SfcUtils.snackbar(`已自动定位到${getTimeProgressStr(lastProgress)}`)
      dp.seek(lastProgress)
    }
  })
}

function initPlayerListener(dp: DPlayer) {
  dp.video.addEventListener(
    'timeupdate',
    MethodInterceptor.createThrottleProxy(
      MethodInterceptor.wrapFun(() => recordProgress(dp.video.currentTime)),
      {
        delay: 5000
      }
    ).invoke
  )
  dp.video.addEventListener('seeked', () => recordProgress(dp.video.currentTime))
}

function paddingZero(num: number) {
  return num < 10 ? `0${num}` : num
}

let recordPromise: Promise<any> | null = null

function getTimeProgressStr(time: number) {
  const hour = Math.floor(time / 3600)
  const minute = Math.floor(time / 60)
  const second = Math.floor(time % 60)
  if (hour) {
    return `${paddingZero(hour)}:${paddingZero(minute)}:${paddingZero(second)}`
  }
  return `${paddingZero(minute)}:${paddingZero(second)}`
}

function getVideoIdentify() {
  return (props.file?.md5 || props.file?.id || props.url) as string
}

/**
 * 记录视频进度
 */
function recordProgress(time: number) {
  const uid = getContext().session.value.user.id
  const identify = getVideoIdentify()
  if (uid) {
    if (recordPromise) {
      return
    }
    recordPromise = SfcUtils.request(VEAPI.recordWatchProgress(uid, identify, time)).then(() => recordPromise = null)
  }
  localStorage.setItem(`watchRecord_${uid}_${identify}`, String(time))
}
/**
 * 获取上次观看记录
 */
async function getLastProgress() {
  const uid = getContext().session.value.user.id
  const identify = getVideoIdentify()
  if (uid) {
    return (await SfcUtils.request(VEAPI.getWatchProgress(uid, identify))).data.data
  }
  const time = localStorage.getItem(`watchRecord_${uid}_${identify}`)
  if (time) {
    return Number(time)
  }
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
import { DPlayerContextMenuItem, DPlayerEvents, DPlayerOptions } from 'dplayer'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted, nextTick, watch, reactive, onUnmounted } from 'vue'
import { StreamInfo, Subtitle, VideoInfo } from '../model'
import SubtitleSelector from './SubtitleSelector.vue'
import { FileInfo, getContext, MethodInterceptor } from 'sfc-common'
import { VEAPI } from '../api'
import { VEUtils } from '../utils/VEUtils'

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