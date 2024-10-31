import { App } from 'vue'

// const allComponent = import.meta.glob('./**/*.vue', { eager: true })

// export default async(app: App) => {
//   const registerSet: Set<string> = new Set()
//   Object.keys(allComponent).forEach(async fileName => {
//     const componentName = (allComponent[fileName] as any).default.name
//     const component = (allComponent[fileName] as any).default
//     if (registerSet.has(componentName)) {
//       return
//     }
//     registerSet.add(componentName)
//     app.component(componentName, component)
//   })
// }

export * from './common'
export * from './form'
export * from './layout'