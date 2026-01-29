import { getContext } from 'sfc-common'
import { RTCScreenRecorder, RTCFileTransfer} from './components'
import { h } from 'vue'
import { ServerRTCConfig } from './model'

function checkIsSupportWebRTC() {
  return 'RTCPeerConnection' in window
}

window.bootContext.addProcessor({
  execute(app, handler) {
    app.component('RTCScreenRecorder', RTCScreenRecorder)
    getContext().menu.value.boxMenu.push({
      name: 'WebRTC应用',
      icon: 'mdi-video-outline',
      id: 'rtc',
      items: [
        {
          id: 'rtc-live',
          icon: 'mdi-motion-play-outline',
          title: '视频直播',
          action: e => {
            if (!checkIsSupportWebRTC()) {
              e.title = 'WebRTC功能不支持'
              e.currentComponent = h('div', '您的浏览器不支持WebRTC功能，建议使用Chrome浏览器或基于Chromium内核的浏览器（如Google Chrome、Microsoft Edge）')
              return
            }
            // ice服务器配置待完善
            const serverRTCConfig = getContext().feature.value.rtcConfig as ServerRTCConfig
            e.currentComponent = h(RTCScreenRecorder, {
              conf: {
                iceServers: serverRTCConfig.useIceServer ? [{ urls: serverRTCConfig.iceServerUrl.split(',') }] : []
              }
            })
          }
        },
        {
          id: 'rtc-file-transfer',
          title: 'P2P文件对传',
          icon: 'mdi-swap-horizontal',
          action: e => {
            if (!checkIsSupportWebRTC()) {
              e.title = 'WebRTC功能不支持'
              e.currentComponent = h('div', '您的浏览器不支持WebRTC功能，建议使用Chrome浏览器或基于Chromium内核的浏览器（如Google Chrome、Microsoft Edge）')
              return
            }
            // ice服务器配置待完善
            const serverRTCConfig = getContext().feature.value.rtcConfig as ServerRTCConfig
            e.currentComponent = h(RTCFileTransfer, {
              conf: {
                iceServers: serverRTCConfig.useIceServer ? [{ urls: serverRTCConfig.iceServerUrl.split(',') }] : []
              }
            })
          }
        }
      ]
    })
  },
  taskName: '注册RTC插件'
})