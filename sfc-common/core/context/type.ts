import { AdminContext } from './menu/type.d'
import { Session } from './session'
import { AppMenu, BoxMenuContext, MenuGroup } from './menu/type'
import { RouteLocationNormalized, Router } from 'vue-router'
import { EventBus } from './EventBus'
import { FileInfo, FileListContext, SystemFeature } from '../model'

export interface RouteInfo {
  /**
   * 当前路由
   */
  curr?: RouteLocationNormalized,
  /**
   * 上一路由
   */
  prev?: RouteLocationNormalized,

  /**
   * 路由器
   */
  router?: Router
}

export interface ValidateErrorMessage {
  id: number,
  errorMessages: string
}

export interface ValidateResult {
  /** 是否通过校验 */
  valid: boolean,

  /** 错误信息 */
  errors: ValidateErrorMessage[]
}

export interface AppFeature {
  enableRegCode: boolean,
  enableEmailReg: boolean,
  [otherKey: string]: any
}

export interface VisiableWindows {
  uploadList: boolean
  [otherKey: string]: boolean
}

/**
 * 文件打开处理器，也就是文件的打开方式
 */
export interface FileOpenHandler {
  /**
   * 标题 文件
   */
  title: string | (() => string)

  /**
   * 图标，可以是mdi图标或图片url
   */
  icon: string

  /**
   * 匹配器，返回true表示待打开的文件可以被该文件处理器处理
   */
  matcher: (ctx: FileListContext, files: FileInfo) => boolean

  /**
   * 排序，越小越靠前
   */
  sort: number

  /**
   * 唯一标识
   */
  id: string

  action: (ctx: FileListContext, files: FileInfo) => Promise<any> | void

  /**
   * 除了自己以外，另外匹配的文件打开方式只有默认的情况下，是否默认使用该打开方式（即优先级高于浏览器打开）
   */
  isDefault?: boolean
}

export type FileClipBoardType = 'cut' | 'copy'

/**
 * 文件剪切板信息
 */
export interface FileClipBoard {
  /** 文件所在路径 */
  path: string

  /** 文件列表 */
  files: FileInfo[]

  /** 剪切板的文件类型 */
  type: FileClipBoardType

  /** 其他自定义附加属性，如uid */
  otherAttr?: any
}

/**
 * 背景图配置选项
 */
export interface BgOption {
  /**
   * 是否启用
   */
  enabled?: boolean

  /**
   * 背景图url
   */
  url?: string,

  /**
   * 背景图不透明度，范围0.1 ~ 1，1完全不透明
   */
  operacity?: number

  /**
   * 尺寸
   */
  size?: 'auto' | 'contain' | 'cover'
}

/**
 * 全局上下文属性
 */
export interface AppContext {
  /**
   * 标题
   */
  appTitle: string,

  /**
   * 当前系统主题
   */
  theme: string,

  /**
   * 当前系统主题（原始，不受黑暗模式影响）
   */
  originTheme: string,

  /**
   * 菜单
   */
  menu: {
    /**
     * 用户界面主菜单
     */
    mainMenu: AppMenu,

    /**
     * 文件列表菜单
     */
    fileListMenu: MenuGroup<FileListContext>[],

    /**
     * 文件列表浏览器顶部按钮
     */
    fileBrowserBtn: MenuGroup<FileListContext>[],

    boxMenu: MenuGroup<BoxMenuContext>[]
  }

  /**
   * 默认头像src属性
   */
  defaultAvatar: string,

  /**
   * 用户会话属性
   */
  session: Session,

  /**
   * 事件总线
   */
  eventBus: EventBus,

  /**
   * 系统功能配置信息
   */
  feature: SystemFeature,

  /**
   * 路由信息
   */
  routeInfo: RouteInfo,

  /**
   * 当前可视的窗口
   */
  visiableWindows: VisiableWindows

  /**
   * 文件打开操作器
   */
  fileOpenHandler: FileOpenHandler[]

  /**
   * 当前的文件剪切板信息
   */
  fileClipBoard: FileClipBoard

  /**
   * 系统背景图信息
   */
  bg: {
    /**
     * 主背景图
     */
    main?: BgOption
  }

  [otherKey: string]: any
}
