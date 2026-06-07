import PxeBootManager from './components/PxeBootManager.vue'

// 注册 PXE 启动管理组件
// 通过 config-properties.json 的 inputType: "template" 方式在管理后台菜单中显示
window.bootContext.addProcessor({
  taskName: '注册PXE启动组件',
  execute(app, handler) {
    // 注册全局组件，名称需与 config-properties.json 中的 template 字段一致
    app.component('PxeBootManager', PxeBootManager)
  },
})
