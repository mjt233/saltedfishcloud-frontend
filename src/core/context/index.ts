import { AppContext, RouteInfo, VisiableWindows } from './type'
import { defaultFileListMenu, defaultMainMenu } from './menu'
import { reactive, Ref, toRefs, ToRefs } from 'vue'
import { emptySession } from './session'
import { DefaultEventBus } from './EventBus'
import { SystemFeature } from '../model'
import { defaultFileOpenHandler } from './fileOpenHandler'

const defaultFeature: SystemFeature = {
  enableEmailReg: false,
  enableRegCode: false,
  extractArchiveType: ['zip'],
  archiveEncoding: 'gbk',
  archiveType: ['zip'],
  version: 'unknown',
  thumbType: ['jpg', 'bmp', 'gif', 'png', 'jpeg', 'webp'],
  breakpointUrl: '/api/breakpoint'
}

const context: ToRefs<AppContext> = toRefs(reactive({
  appTitle: '咸鱼云网盘',
  theme: 'default',
  originTheme: 'default',
  menu: {
    mainMenu: defaultMainMenu,
    fileListMenu: defaultFileListMenu
  },
  defaultAvatar: '/api/static/defaultAvatar.png',
  session: emptySession,
  routeInfo: {},
  eventBus: new DefaultEventBus(),
  feature: defaultFeature,
  fileOpenHandler: reactive([
    defaultFileOpenHandler
  ]),
  visiableWindows: reactive({
    uploadList: false
  } as VisiableWindows)
}))


export {
  context
}

export * from './menu/type'
export * from './type'