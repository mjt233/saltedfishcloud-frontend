import router from '@/plugins/router'
import vuetify from '@/plugins/vuetify'
import { App, Component, createApp } from 'vue'

const buildApp = (rootComponent: Component ) => {
  const app = createApp(rootComponent)
  initApp(app)
  return app
}

const initApp = (app: App<Element>) => {
  app.use(router)
    .use(vuetify)
}

export {
  buildApp,
  initApp
}