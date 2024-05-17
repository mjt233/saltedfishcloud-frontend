import ConfigureInfo from './components/ConfigureInfo.vue'
import EncoderInfo from './components/EncoderInfo.vue'
import EncoderInfoList from './components/EncoderInfoList.vue'
import VideoEnhanceCheck from './components/VideoEnhanceCheck.vue'

window.bootContext.addProcessor({
  taskName: '注册组件',
  execute(app, handler) {
    app.component('ConfigureInfo', ConfigureInfo)
    app.component('EncoderInfo', EncoderInfo)
    app.component('EncoderInfoList', EncoderInfoList)
    app.component(VideoEnhanceCheck.name as string, VideoEnhanceCheck)
  }
})

export {}