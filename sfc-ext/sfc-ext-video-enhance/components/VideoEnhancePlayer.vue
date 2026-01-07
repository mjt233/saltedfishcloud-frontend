<template>
  <div ref="rootRef" class="player-root">
    <div ref="playerRef" class="player">
      <h1>播放加载失败了QAQ</h1>
    </div>
    
  </div>
</template>

<script setup lang="ts">
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
let subtitleRender: SubtitleRender | null


const reloadPlayer = async(playerOpt: DPlayerOptions) => {
  const cur = dp.video.currentTime
  dp.destroy()
  dp = new window.DPlayer(playerOpt)
  initPlayerListener(dp)
  dp.play()
  dp.seek(cur)
  tryInitExternalSubtitleRender()
}

/**
 * 创建外部字幕渲染器
 * @param subtitle 需要渲染的字幕
 */
function createExternalSubtitleRender(subtitle: Subtitle) {
  if (subtitleRender) {
    const container = subtitleRender.getContainer()
    if (container) {
      playerRef.value.removeChild(container)
    }
    subtitleRender.destroy()
  }
  subtitleRender = createSubtitleRender(subtitle)
  return subtitleRender
}

async function tryInitExternalSubtitleRender() {
  if (!subtitleRender || !dp) {
    return
  }
  const container = await subtitleRender.init(dp.video)
  playerRef.value.appendChild(container)
  container.classList.add('video-ass-subtitle')
}

/**
 * 初始化播放器字幕选项
 * @param opt DPlayer的配置选项
 * @param subtitle 需要显示的字幕
 */
async function initPlayerOptSubtitle(opt: DPlayerOptions, subtitle: Subtitle) {
  if (subtitleRender) {
    const existSubtitleContainer = subtitleRender.getContainer()
    if (existSubtitleContainer) {
      playerRef.value.removeChild(existSubtitleContainer)
    }
    subtitleRender.destroy()
    subtitleRender = null
  }
  if (subtitle.type == 'webvtt') {
    // DPlayer内置支持webvtt
    opt.subtitle = {
      url: subtitle.url,
      fontSize: '21px'
    };
    (opt.contextmenu as DPlayerContextMenuItem[])[0].text = '字幕：' + subtitle.title
  } else {
    // DPlayer内置不支持的字幕类型，需要外部渲染
    opt.subtitle = undefined
    createExternalSubtitleRender(subtitle)
    if (!subtitleRender) {
      window.SfcUtils.alert(`不支持的字幕类型:${subtitle.type}`)
    } else {
      (opt.contextmenu as DPlayerContextMenuItem[])[0].text = '字幕：' + subtitle.title
    }
  }
}

function initPlayer() {
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
              // 存在外部字幕渲染器时，直接重新初始化字幕渲染器即可，无需重载播放器
              if (subtitleRender) {
                await tryInitExternalSubtitleRender()
              } else {
                reloadPlayer(opt)
              }
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
  tryInitExternalSubtitleRender()
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
})
onUnmounted(() => {
  if (dp) {
    dp.destroy()
  }
  if (subtitleRender) {
    subtitleRender.destroy()
  }
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
import { createSubtitleRender, SubtitleRender } from '../subtitle/subtitleRender'

export default defineComponent({
  name: 'VideoEnhancePlayer'
})
</script>
<style>
.video-ass-subtitle {
  width: 100% !important;
  height: 100% !important;
  position: absolute !important;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1000;
}
</style>

<style scoped lang="scss">
.player-root {
  position: relative;
}
</style>