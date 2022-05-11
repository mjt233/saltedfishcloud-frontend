import { AppContext } from './type'
import defaultMainMenu from './menu'
import { reactive, toRefs, ToRefs } from 'vue'
import { emptySession } from './session'


const context: ToRefs<AppContext> = toRefs(reactive({
  appTitle: '咸鱼云网盘',
  theme: 'default',
  menu: {
    mainMenu: defaultMainMenu
  },
  defaultAvatar: '/api/static/defaultAvatar.png',
  session: emptySession,
  routeInfo: {
  }
}))


export {
  context
}

export * from './menu/type'
export * from './type'