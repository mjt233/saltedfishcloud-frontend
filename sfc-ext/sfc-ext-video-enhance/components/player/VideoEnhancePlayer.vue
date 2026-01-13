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
const curSubtitle = ref() as Ref<Subtitle | null | undefined>
const dplayerOptions:DPlayerOptions = {
  container: playerRef.value
}
const playerSettingProps = reactive({
  subtitleList: props.subtitleList,
  curSubtitle: curSubtitle.value,
  onSubtitleChange(subtitle: Subtitle | null) {
    changeSubtitle(subtitle)
  }
})

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
  addPlayerControllerSetting()
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
  if (!container) {
    return
  }
  container.classList.add('video-subtitle-container')
  playerRef.value.appendChild(container)
}

/**
 * 初始化播放器字幕选项，当需要使用外部字幕渲染器时会创建渲染器并记录在变量subtitleRender中。
 * 如果不需要外部字幕渲染器则会将变量subtitleRender置空。
 * @param opt DPlayer的配置选项
 * @param subtitle 需要显示的字幕
 * @returns 是否切换成功，不成功则说明不支持该字幕类型
 */
async function initPlayerOptSubtitle(subtitle?: Subtitle | null): Promise<boolean> {
  if (subtitleRender) {
    const existSubtitleContainer = subtitleRender.getContainer()
    if (existSubtitleContainer) {
      playerRef.value.removeChild(existSubtitleContainer)
    }
    subtitleRender.destroy()
    subtitleRender = null
  }
  if (!subtitle) {
    curSubtitle.value = undefined
    dplayerOptions.subtitle = undefined
    playerSettingProps.curSubtitle = curSubtitle.value
    return true
  }

  if (subtitle.type == 'webvtt') {
    // DPlayer内置支持webvtt
    dplayerOptions.subtitle = {
      url: subtitle.url,
      fontSize: '21px'
    }
    curSubtitle.value = subtitle
    playerSettingProps.curSubtitle = curSubtitle.value
    return true
  } else {
    // DPlayer内置不支持的字幕类型，需要外部渲染
    dplayerOptions.subtitle = undefined
    createExternalSubtitleRender(subtitle)
    if (!subtitleRender) {
      return false
    } else {
      curSubtitle.value = subtitle
      playerSettingProps.curSubtitle = curSubtitle.value
      return true
    }
  }
}

/**
 * 切换字幕
 * @param subtitle 目标字幕。关闭字幕时传入null或undefined即可。
 */
async function changeSubtitle(subtitle?: Subtitle | null) {
  const originSubtitle = curSubtitle.value
  // 初始化新字幕的播放配置 或 创建外部字幕渲染器
  if(!initPlayerOptSubtitle(subtitle)) {
    dp.notice('不支持该字幕格式的播放 ' + subtitle?.type || '', 4000, 0.8)
    return
  }

  // 原本是webvtt字幕时，需要重新加载播放器来移除字幕
  if (originSubtitle && originSubtitle.type == 'webvtt' || subtitle?.type == 'webvtt') {
    reloadPlayer(dplayerOptions)
    return
  }

  // 存在外部字幕渲染器时，直接重新初始化字幕渲染器即可，无需重载播放器
  if (subtitleRender) {
    await tryInitExternalSubtitleRender()
  }
}

function initPlayer() {
  if (!props.url) {
    return
  }
  dplayerOptions.container = playerRef.value
  dplayerOptions.video = {
    url: props.url
  }
  const initMsgs = [] as string[]
  if (props.videoInfo) {
    if (props.subtitleList.length) {
      const defaultSubtitle = props.subtitleList.find(e => e.isDefault && VEUtils.isSupportSubtitleType(e.type))
      if (defaultSubtitle) {
        initPlayerOptSubtitle(defaultSubtitle)
        initMsgs.push(`检测到${props.subtitleList.length}个字幕 并自动加载: ${defaultSubtitle.title}`)
      } else {
        initMsgs.push(`检测到${props.subtitleList.length}个字幕`)
      }
    }

    if (props.videoInfo.chapters.length) {
      dplayerOptions.highlight = props.videoInfo.chapters.map(c => {
        return {
          text: c.title,
          time: Number(c.startTime)
        }
      })
    }
  }
  dp = new window.DPlayer(dplayerOptions)
  initPlayerListener(dp)
  dp.play()
  dp.video.addEventListener('loadeddata', async() => {
    const lastProgress = await getLastProgress()
    if (lastProgress) {
      dp.notice(`自动跳转到上次观看记录 ${getTimeProgressStr(lastProgress)}`, 5000, 0.8)
      dp.seek(lastProgress)
    }
  })
  initMsgs.forEach(m => dp.notice(m, 5000, 0.8))
  tryInitExternalSubtitleRender()
  addPlayerControllerSetting()
}

/**
 * 给DPlayer播放器添加额外的可交互的设置参数
 */
function addPlayerControllerSetting() {
  if (!dp) {
    return
  }
  const rightSettings = playerRef.value.querySelector('.dplayer-icons-right') as HTMLElement
  if (!rightSettings) {
    return
  }
  rightSettings.style.display = 'flex'
  rightSettings.style.alignItems = 'center'
  window.SfcUtils.dyncmount(PlayerSetting, {
    tempDOMHandler(dom) {
      dom.style = 'display: inline-block;color: #cfd5d0;font-size: 14px'
      // 将rightSettings插入到dom的最前面
      rightSettings?.insertBefore(dom, rightSettings.firstChild)
    },
    wrapVApp: false,
    props: playerSettingProps
  })
}

function initPlayerListener(dp: DPlayer) {
  dp.video.addEventListener(
    'timeupdate',
    MethodInterceptor.createThrottleProxyFunc(() => recordProgress(dp.video.currentTime), {
      delay: 5000
    })
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
import { StreamInfo, Subtitle, VideoInfo } from '../../model'
import SubtitleSelector from './SubtitleSelector.vue'
import { FileInfo, getContext, MethodInterceptor } from 'sfc-common'
import { VEAPI } from '../../api'
import { VEUtils } from '../../core/VEUtils'
import { createSubtitleRender, SubtitleRender } from '../../core/subtitleRender'
import PlayerSetting from './PlayerSetting.vue'

export default defineComponent({
  name: 'VideoEnhancePlayer'
})
</script>
<style>
.video-subtitle-container {
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