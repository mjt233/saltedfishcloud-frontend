import ConfigureInfo from './components/ConfigureInfo.vue'
import EncoderInfo from './components/EncoderInfo.vue'
import EncoderInfoList from './components/EncoderInfoList.vue'

window.bootContext.addProcessor({
  taskName: '注册组件',
  execute(app, handler) {
    app.component('ConfigureInfo', ConfigureInfo)
    app.component('EncoderInfo', EncoderInfo)
    app.component('EncoderInfoList', EncoderInfoList)
  }
})

export {}