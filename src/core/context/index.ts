import { AppContext } from './type'
import defaultMainMenu from './menu'
import { reactive, toRefs, ToRefs } from 'vue'
import { emptySession } from './session'
import { DefaultEventBus } from './EventBus'

const context: ToRefs<AppContext> = toRefs(reactive({
  appTitle: '咸鱼云网盘',
  theme: 'default',
  originTheme: 'default',
  menu: {
    mainMenu: defaultMainMenu
  },
  defaultAvatar: '/api/static/defaultAvatar.png',
  session: emptySession,
  routeInfo: {},
  eventBus: new DefaultEventBus(),
  feature: {
    enableRegCode: false,
    enableEmailReg: false
  }
}))


export {
  context
}

export * from './menu/type'
export * from './type'