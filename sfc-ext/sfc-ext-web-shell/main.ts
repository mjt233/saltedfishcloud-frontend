import WsSimpleExecView from './components/WsSimpleExecView.vue'
import WsInteractiveExecView from './components/WsInteractiveExecView.vue'
window.bootContext.addProcessor({
  execute(app, handler) {
    app.component(WsSimpleExecView.name, WsSimpleExecView)
    app.component(WsInteractiveExecView.name, WsInteractiveExecView)
  },
  taskName: '注册WebShell组件'
})