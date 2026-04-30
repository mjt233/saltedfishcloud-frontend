import { AppContext, FileClipBoard, VisiableWindows } from './type'
import { defaultFileListMenu, defaultMainMenu } from './menu'
import { reactive, toRefs, ToRefs } from 'vue'
import { emptySession } from './session'
import { DefaultEventBus } from './EventBus'
import { SystemFeature } from 'sfc-common/model'
import { defaultFileOpenHandlers } from './fileOpenHandler'
import { defaultFileBrowserTopBtns } from 'sfc-common/core/actions/FileList/FileListBtn'
import defaultBoxMenu from './menu/BoxMenu'

const defaultFeature: SystemFeature = reactive({
  enableEmailReg: false,
  enableRegCode: false,
  archiveEngineList: [],
  version: 'unknown',
  thumbType: ['jpg', 'bmp', 'gif', 'png', 'jpeg', 'webp'],
  breakpointUrl: '/api/breakpoint',
  darkTheme: false,
  isUseCommonUpload: false
})

const context: ToRefs<AppContext> = toRefs(reactive({
  appTitle: '咸鱼云网盘',
  theme: 'default',
  originTheme: 'default',
  menu: {
    mainMenu: defaultMainMenu,
    fileListMenu: defaultFileListMenu,
    fileBrowserBtn: defaultFileBrowserTopBtns,
    boxMenu: defaultBoxMenu
  },
  fileAttributeSections: [],
  defaultAvatar: '/api/static/defaultAvatar.png',
  session: emptySession,
  routeInfo: {},
  eventBus: new DefaultEventBus(),
  feature: defaultFeature,
  fileOpenHandler: defaultFileOpenHandlers,
  fileClipBoard: undefined as unknown as FileClipBoard,
  visiableWindows: reactive({
    uploadList: false
  } as VisiableWindows),
  bg: {
    main: {
      url: '',
      size: 'cover',
      enabled: false
    }
  }
}))


export function getContext() {
  return context
}

export * from './menu/type'
export * from './type'
export * from './fileAttributeExtension'