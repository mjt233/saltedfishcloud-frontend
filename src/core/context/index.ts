import { AppContext } from './type'
import defaultAppMenu from './menu'
import { reactive, toRefs, ToRefs } from 'vue'



const context: ToRefs<AppContext> = toRefs(reactive({
  appTitle: '咸鱼云网盘',
  theme: 'default',
  menu: defaultAppMenu
}))


export {
  context
}

export * from './menu/type'
export * from './type'