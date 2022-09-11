import { App } from 'vue'

const allComponent = import.meta.globEager('./**/*.vue')

export default (app: App) => {
  const registerSet: Set<string> = new Set()
  Object.keys(allComponent).forEach(fileName => {
    const componentName = allComponent[fileName].default.name
    const component = allComponent[fileName].default
    if (registerSet.has(componentName)) {
      return
    }
    registerSet.add(componentName)
    app.component(componentName, component)
  })
}

export * from './common'
export * from './form'
export * from './layout'