import Ji from './assert/j.mp3'
import Ni from './assert/n.mp3'
import Tai from './assert/t.mp3'
import Mei from './assert/m.mp3'
import JNTM from './assert/jntm.mp3'

let playing: HTMLAudioElement | null

/**
 * 播放音频
 * @param url 音频url
 */
function playAudio(url: string) {
  if (playing) {
    playing.pause()
    document.body.removeChild(playing)
    playing = null
  }
  const audio = document.createElement('audio')
  audio.src = url
  audio.autoplay = true
  audio.style.display = 'hidden'
  audio.addEventListener('ended', () => {
    document.body.removeChild(audio)
  })
  document.body.append(audio)
  audio.play()
  return audio
}

/**
 * 预加载
 */
function preload() {
  [Ji, Ni, Tai, Mei, JNTM].forEach(url => {
    const audio = document.createElement('audio')
    audio.src = url
    audio.preload = 'metadata'
    audio.style.display = 'hidden'
    audio.onended = () => {
      document.body.removeChild(audio)
    }
    document.body.append(audio)
  })
}

preload()

let jiCount = 0
let isActiveJntm = false

let firstPlay: number = 0
window.addEventListener('keydown', e => {
  // 连按5次j触发鸡你太美模式
  if (e.key === undefined) {
    return
  }
  if (e.key.toLowerCase() == 'j') {
    jiCount++
    if (jiCount == 5 && !isActiveJntm) {
      window.SfcUtils.snackbar('🐔你太美')
      isActiveJntm = true
    }
  } else {
    jiCount = 0
  }

  if (!isActiveJntm) {
    return
  }

  if(e.key.toLowerCase() == 'j') {
    firstPlay = new Date().getTime()
    playAudio(Ji)
  }
  if(e.key.toLowerCase() == 'n') {
    playAudio(Ni)
  }
  if(e.key.toLowerCase() == 't') {
    playAudio(Tai)
  }
  if(e.key.toLowerCase() == 'm') {
    const now = new Date().getTime()
    if (now - firstPlay <= 750) {
      playing = playAudio(JNTM)
      playing.addEventListener('ended', () => document.body.removeChild(playing as HTMLElement))
    } else {
      playAudio(Mei)
    }
    
  }
})

export {}