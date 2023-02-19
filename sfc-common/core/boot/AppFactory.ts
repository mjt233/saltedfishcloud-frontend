import router from 'sfc-common/plugins/router'
import vuetify from 'sfc-common/plugins/vuetify'
import { App, Component, createApp } from 'vue'
import component from 'sfc-common/components'

const buildApp = (rootComponent: Component ) => {
  const app = createApp(rootComponent)
  initApp(app)
  return app
}

const initApp = (app: App<Element>) => {
  app.use(router)
    .use(vuetify)
    .use(component)
}

export {
  buildApp,
  initApp
}