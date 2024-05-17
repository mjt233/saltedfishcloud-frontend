import router from 'sfc-common/plugins/router'
import vuetify from 'sfc-common/plugins/vuetify'
import { App, Component, createApp } from 'vue'
import component from 'sfc-common/components'

// 记录所有后面额外再次注册的组件
const globalRegisteredComponent = {} as {[name: string]: Component}

const buildApp = (rootComponent: Component ) => {
  const app = createApp(rootComponent)
  initApp(app)
  return app
}

const initApp = (app: App<Element>) => {
  app.use(router)
    .use(vuetify)
    .use(component)
  const originComponentMethod = app.component

  // 把之前额外注册过的组件，全部再在新的app实例中注册一次
  Object.keys(globalRegisteredComponent).forEach(name => {
    const compo = globalRegisteredComponent[name]
    if (compo) {
      originComponentMethod(name, globalRegisteredComponent[name])
    }
  })

  // 创建App.component的代理方法，注册组件时，把组件同步记录到全局组件记录globalRegisteredComponent中
  // 以便后续创建的App实例也能用到这些组件
  app.component = ((name: string, component?: Component) => {
    if (component) {
      globalRegisteredComponent[name] = component
      return originComponentMethod(name, component)
    } else {
      return originComponentMethod(name)
    }
  }) as {
    (name: string): Component | undefined;
    (name: string, component: Component): App;
  }
}

export {
  buildApp,
  initApp
}